import {
    BounceState,
    Context,
    GamePlayerInputPayload,
    GameState,
    GameStateUpdatePayload,
    applyInputListToSimulation,
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
    private shouldReconciliateState = false;
    public gameTimeIsSynchronized = false;
    public inputsToSendBuffer: GamePlayerInputPayload[] = [];

    /**
     * It's in fact the prediction state
     */
    public currentState: GameState; // simulation present
    public displayState: GameState; // simulation present
    public serverGameState: GameState; // simulation validated by the server, present - RTT

    public sendInputIntervalId: number = 0;
    public gameTimeDelta = 0;
    public bufferHistorySize = 10;

    public inputsHistory: Record<number, GamePlayerInputPayload[]> = {};
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
        if (this.sendInputs && this.inputsToSendBuffer.length > 0) {
            this.sendInputs(this.inputsToSendBuffer);
            this.inputsToSendBuffer = [];
        }
    };

    public addToInputsHistory = (
        input: GamePlayerInputPayload,
        gameTime: number,
    ) => {
        if (this.inputsHistory[gameTime]) {
            this.inputsHistory[gameTime].push(input);
        } else {
            this.inputsHistory[gameTime] = [input];
        }
    };

    // Method for collecting main player inputs
    public collectInput = (input: GamePlayerInputPayload) => {
        this.inputsToSendBuffer.push(input);
    };

    public onGameGameStateUpdate = (data: GameStateUpdatePayload) => {
        this.shouldReconciliateState = true;
        this.serverGameState = data.gameState;
        this.lastServerInputs = data.lastInputs;
    };

    public addToPredictionHistory = (state: GameState) => {
        this.predictionHistory.push(JSON.parse(JSON.stringify(state)));
        if (this.predictionHistory.length > this.bufferHistorySize) {
            this.predictionHistory.shift();
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
        const inputsHistoryKeys = Object.keys(this.inputsHistory);
        for (let i = 0; i < inputsHistoryKeys.length; i++) {
            const sequence = Number(inputsHistoryKeys[i]);
            if (sequence <= this.serverState.lastValidatedInput) {
                delete this.inputsHistory[sequence];
            }
        }
        const nextState: GameState = JSON.parse(
            JSON.stringify(this.serverGameState),
        );
        const nextPredictionHistory: GameState[] = [
            JSON.parse(JSON.stringify(this.serverState)),
        ];

        while (nextState.game_time < this.currentState.game_time) {
            nextState.game_time++;
            applyInputListToSimulation(
                delta,
                this.inputsHistory[nextState.game_time] || [],
                collidingElements,
                nextState,
                Context.client,
                false,
                Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
            );

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
        // Calculate one-way latency
        let oneWayLatency = Math.floor(rtt / 2);

        // Set gameTimeDelta based on one-way latency
        this.gameTimeDelta = oneWayLatency;

        // Set bufferHistorySize based on gameTimeDelta
        // This could be adjusted based on the specific needs of your game
        this.bufferHistorySize = this.gameTimeDelta * 2;

        // this.gameDelta = Math.floor(rtt / 2);
        // this.gameDelta = delta;
        this.gameTimeIsSynchronized = true;
        // this.bufferHistorySize = this.gameDelta;
        // one trip time

        let sendInputsInterval = 20;
        console.log('average RTT', rtt);
        console.log('one way latency', oneWayLatency);
        // console.log('send inputs interval', sendInputsInterval);
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

        // console.log('prediction history size', this.predictionHistory.length);
        // console.log('buffer history size', this.bufferHistorySize);

        // const ratio = this.gameDelta - Math.floor(this.gameDelta * 0.75);
        // if (this.predictionHistory.length >= this.bufferHistorySize) {
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
        // }
    };
}
