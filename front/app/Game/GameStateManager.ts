import {
    BounceState,
    Context,
    GamePlayerInputPayload,
    GameState,
    GameStateUpdatePayload,
    applyInputListToSimulation,
    collectInputsForTick,
} from '@benjaminbours/composite-core';
import { Object3D, Object3DEventMap } from 'three';

interface InterpolationConfig {
    ratio: number;
    increment: number;
    shouldUpdate: boolean;
}

// TODO: Keep refactoring the game state manager. So far, a lot of thing in app has
// just been prefixed by "".
export class GameStateManager {
    private interpolation: InterpolationConfig = {
        ratio: 0,
        increment: 5,
        shouldUpdate: false,
    };
    private shouldReconciliateState = false;
    private gameTimeIsSynchronized = false;
    private inputBuffer: GamePlayerInputPayload[] = [];

    /**
     * It's in fact the prediction state
     */
    public currentState: GameState; // simulation present
    public displayState: GameState; // simulation present
    public serverGameState: GameState; // simulation validated by the server, present - RTT

    public sendInputIntervalId: number = 0;
    public gameTimeDelta = 0;
    public bufferHistorySize = 10;

    public inputsHistory: GamePlayerInputPayload[] = [];
    public lastServerInputs: [
        GamePlayerInputPayload | undefined,
        GamePlayerInputPayload | undefined,
    ] = [undefined, undefined];
    public predictionHistory: GameState[] = [];

    constructor(
        initialGameState: GameState,
        private sendInputs?: (inputs: GamePlayerInputPayload[]) => void,
    ) {
        this.currentState = JSON.parse(JSON.stringify(initialGameState));
        this.displayState = JSON.parse(JSON.stringify(initialGameState));
        this.serverGameState = JSON.parse(JSON.stringify(initialGameState));
    }

    public destroy = () => {
        console.log('cleared interval');
        clearInterval(this.sendInputIntervalId);
    };

    // private calculateDistance(origin: Vec2, target: Vec2) {
    //     const vector = new Vector2(origin.x, origin.y);
    //     const vectorTarget = new Vector2(target.x, target.y);
    //     return vector.distanceTo(vectorTarget);
    // }

    // Method for sending buffered inputs to the server
    public sendBufferedInputs = () => {
        if (this.sendInputs && this.inputBuffer.length > 0) {
            this.sendInputs(this.inputBuffer);
            this.inputBuffer = [];
        }
    };

    // Method for collecting player inputs
    public collectInput = (input: GamePlayerInputPayload) => {
        this.inputBuffer.push(input);
    };

    private interpolateGameState(states: GameState[], t: number): GameState {
        const interpolatedState: GameState = JSON.parse(
            JSON.stringify(states[0]),
        );

        // Interpolate each player's position and velocity
        for (let i = 0; i < interpolatedState.players.length; i++) {
            interpolatedState.players[i].position = { x: 0, y: 0 };
            interpolatedState.players[i].velocity = { x: 0, y: 0 };

            for (let j = 0; j < states.length; j++) {
                let basis = 1;
                for (let m = 0; m < states.length; m++) {
                    if (m != j) {
                        basis *=
                            (t - m / (states.length - 1)) /
                            (j / (states.length - 1) - m / (states.length - 1));
                    }
                }

                interpolatedState.players[i].position.x +=
                    basis * states[j].players[i].position.x;
                interpolatedState.players[i].position.y +=
                    basis * states[j].players[i].position.y;
                interpolatedState.players[i].velocity.x +=
                    basis * states[j].players[i].velocity.x;
                interpolatedState.players[i].velocity.y +=
                    basis * states[j].players[i].velocity.y;
            }
        }

        // Interpolate level state and bounces
        if ('level' in states[0] && 'bounces' in states[0].level) {
            const interpolatedBounces: BounceState = {};

            for (const key in states[0].level.bounces) {
                interpolatedBounces[key] = { rotationY: 0 };

                for (let j = 0; j < states.length; j++) {
                    if (key in (states[j].level as any).bounces) {
                        let basis = 1;
                        for (let m = 0; m < states.length; m++) {
                            if (m != j) {
                                basis *=
                                    (t - m / (states.length - 1)) /
                                    (j / (states.length - 1) -
                                        m / (states.length - 1));
                            }
                        }

                        interpolatedBounces[key].rotationY +=
                            basis *
                            (states[j].level as any).bounces[key].rotationY;
                    }
                }
            }

            interpolatedState.level = {
                ...interpolatedState.level,
                bounces: interpolatedBounces,
                // Add other level properties here
            } as any;
        }

        return interpolatedState;
    }

    public onGameGameStateUpdate = (data: GameStateUpdatePayload) => {
        this.shouldReconciliateState = true;
        this.serverGameState = data.gameState;
        this.lastServerInputs = data.lastInputs;
    };

    public addToPredictionHistory = (state: GameState) => {
        if (this.gameTimeIsSynchronized) {
            this.predictionHistory.push(JSON.parse(JSON.stringify(state)));

            if (this.predictionHistory.length > this.bufferHistorySize) {
                this.predictionHistory.shift();
            }
        }
    };

    public reconciliateState = (
        collidingElements: Object3D<Object3DEventMap>[],
        delta: number,
    ) => {
        if (!this.shouldReconciliateState) {
            return;
        }

        this.shouldReconciliateState = false;
        // remove inputs that have been validated by the server
        this.inputsHistory = this.inputsHistory.filter(
            ({ sequence }) =>
                sequence >= this.serverGameState.lastValidatedInput,
        );
        const nextState: GameState = JSON.parse(
            JSON.stringify(this.serverGameState),
        );
        const inputs: GamePlayerInputPayload[] = JSON.parse(
            JSON.stringify(this.inputsHistory),
        );
        const predictionHistory: GameState[] = [
            JSON.parse(JSON.stringify(this.serverGameState)),
        ];
        const lastPlayersInput: (GamePlayerInputPayload | undefined)[] = [
            undefined,
            undefined,
        ];

        this.lastServerInputs.forEach((input, index) => {
            if (input) {
                lastPlayersInput[index] = JSON.parse(JSON.stringify(input));
            }
        });
        while (nextState.game_time < this.currentState.game_time) {
            nextState.game_time++;
            const inputsForTick = collectInputsForTick(
                inputs,
                nextState.game_time,
            );

            for (let i = 0; i < inputsForTick.length; i++) {
                const inputs = inputsForTick[i];
                lastPlayersInput[i] = applyInputListToSimulation(
                    delta,
                    lastPlayersInput[i],
                    inputs,
                    collidingElements,
                    nextState,
                    Context.client,
                    false,
                    Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
                );
                for (let i = 0; i < inputs.length; i++) {
                    const input = inputs[i];
                    inputs.splice(inputs.indexOf(input), 1);
                }
            }

            const snapshot = JSON.parse(JSON.stringify(nextState));
            predictionHistory.push(snapshot);
            if (predictionHistory.length > this.bufferHistorySize) {
                predictionHistory.shift();
            }
        }

        // const distanceAfterInputsApply = this.calculateDistance(
        //     JSON.parse(
        //         JSON.stringify(
        //             this.currentState.players[this.playersConfig[0]].position,
        //         ),
        //     ),
        //     nextState.players[this.playersConfig[0]].position,
        // );
        // console.log(
        //     'current position',
        //     JSON.parse(
        //         JSON.stringify(
        //             this.currentState.players[this.playersConfig[0]].position,
        //         ),
        //     ),
        // );
        // console.log(
        //     'next position',
        //     nextState.players[this.playersConfig[0]].position,
        // );
        // console.log('distance after inputs apply', distanceAfterInputsApply);

        this.predictionHistory = predictionHistory;
        this.currentState.players = nextState.players;
        this.currentState.level = nextState.level;
    };

    public onAverageRttReceived = (serverTime: number, rtt: number) => {
        // this.gameDelta = Math.floor(rtt / 2);
        // this.gameDelta = delta;
        this.gameTimeIsSynchronized = true;
        // this.bufferHistorySize = this.gameDelta;
        console.log('average RTT', rtt);

        // one trip time

        let sendInputsInterval;
        if (rtt <= 15) {
            this.gameTimeDelta = 15;
            this.bufferHistorySize = 15;
            sendInputsInterval = 20;
        } else if (rtt <= 30) {
            this.gameTimeDelta = rtt;
            this.bufferHistorySize = 15;
            sendInputsInterval = 20;
        } else if (rtt <= 50) {
            this.gameTimeDelta = Math.floor(rtt / 1.5);
            this.bufferHistorySize = 25;
            sendInputsInterval = 30;
        } else if (rtt <= 100) {
            this.gameTimeDelta = Math.floor(rtt / 2);
            this.bufferHistorySize = 25;
            sendInputsInterval = 50;
        } else if (rtt <= 200) {
            this.gameTimeDelta = Math.floor(rtt / 3);
            this.bufferHistorySize = 50;
            sendInputsInterval = 100;
        } else if (rtt <= 1000) {
            this.gameTimeDelta = Math.floor(rtt / 10);
            this.bufferHistorySize = 50;
            sendInputsInterval = 100;
        }
        console.log('game time delta', this.gameTimeDelta);
        console.log('send inputs interval', sendInputsInterval);
        console.log('buffer history size', this.bufferHistorySize);
        this.currentState.game_time = serverTime + this.gameTimeDelta;

        // basically, this condition means if we have a socket controller
        if (this.sendInputs) {
            // Call sendBufferedInputs at regular intervals
            this.sendInputIntervalId = setInterval(() => {
                if (this.inputBuffer.length > 0) {
                    this.sendInputs!(this.inputBuffer);
                    this.inputBuffer = [];
                }
            }, sendInputsInterval) as any;
        }
    };

    public computeDisplayState = () => {
        if (!this.gameTimeIsSynchronized) {
            this.displayState = this.currentState;
            return;
        }

        // const ratio = this.gameDelta - Math.floor(this.gameDelta * 0.75);
        if (this.predictionHistory.length >= this.bufferHistorySize) {
            // const statesToInterpolate = this.predictionHistory.slice(-offset);
            const interpolatedState = this.interpolateGameState(
                // statesToInterpolate,
                this.predictionHistory,
                this.interpolation.ratio,
            );

            // Update the ratio for the next frame
            this.interpolation.ratio += this.interpolation.increment;

            // If the ratio exceeds 1, we've reached the next state
            if (this.interpolation.ratio >= 1) {
                // // Remove the previous state from the buffer
                this.predictionHistory.shift();

                // Reset the ratio
                this.interpolation.ratio = 0;
            }

            // Update the display state to the interpolated state
            this.displayState = interpolatedState;
        }
    };
}
