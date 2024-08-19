import {
    Context,
    GamePlayerInputPayload,
    GameState,
    GameStateUpdatePayload,
    LevelStartPosition,
    Side,
    applyInputListToSimulation,
} from '@benjaminbours/composite-core';
import { Object3D, Object3DEventMap } from 'three';

// TODO: Keep refactoring the game state manager. So far, a lot of thing in app has
// just been prefixed by "".
export class GameStateManager {
    private shouldReconciliateState = false;
    public gameTimeIsSynchronized = false;
    public inputsToSendBuffer: GamePlayerInputPayload[] = [];

    public predictionState: GameState; // simulation present
    public displayState: GameState;
    private serverState: GameState; // simulation validated by the server, present - RTT

    public sendInputIntervalId: number = 0;
    public gameTimeDelta = 0;
    public bufferHistorySize = 10;

    public inputsHistory: Record<number, GamePlayerInputPayload[]> = {};
    public lastServerInputs: [
        GamePlayerInputPayload | undefined,
        GamePlayerInputPayload | undefined,
    ] = [undefined, undefined];
    public predictionHistory: GameState[] = [];

    // correction
    private stateCorrection: Partial<GameState> | null = null;
    private correctionMaxIncrement = 0;
    private correctionCounter = 0;

    public startPosition?: LevelStartPosition;
    public mainPlayerSide?: Side;

    constructor(
        initialGameState: GameState,
        private sendInputs?: (inputs: GamePlayerInputPayload[]) => void,
    ) {
        this.predictionState = initialGameState;
        this.displayState = initialGameState;
        this.serverState = initialGameState;
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
        this.serverState = data.gameState;
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

        // find the predicted state equivalent to the server state
        const predictedState = this.predictionHistory.find(
            (state) => state.game_time === this.serverState.game_time,
        );

        if (!predictedState) {
            return;
        }

        const differenceWithServerState = this.calculateStateDifference(
            this.serverState,
            predictedState,
        );

        // if there is no difference between the prediction and the server state, no reconciliation is needed
        if (!differenceWithServerState) {
            // console.log('no difference with server state, no reconciliation');
            return;
        }

        const nextState: GameState = JSON.parse(
            JSON.stringify(this.serverState),
        );
        const nextPredictionHistory: GameState[] = [
            JSON.parse(JSON.stringify(this.serverState)),
        ];

        while (nextState.game_time < this.predictionState.game_time) {
            nextState.game_time++;
            applyInputListToSimulation(
                delta,
                this.inputsHistory[nextState.game_time] || [],
                collidingElements,
                nextState,
                this.startPosition!,
                Context.client,
                this.mainPlayerSide!,
                false,
                Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
            );

            const snapshot = JSON.parse(JSON.stringify(nextState));
            nextPredictionHistory.push(snapshot);
        }

        // calculate the difference between the current prediction state and the corrected prediction
        this.stateCorrection = this.calculateStateDifference(
            this.predictionState,
            nextState,
        );

        // update the prediction history with the correct predictions
        this.predictionHistory = nextPredictionHistory;

        // update prediction state parts that does not require progressive correction
        for (let i = 0; i < this.predictionState.players.length; i++) {
            const player = this.predictionState.players[i];
            player.state = nextState.players[i].state;
        }
        this.predictionState.level.doors = nextState.level.doors;
        this.predictionState.level.end_level = nextState.level.end_level;
    };

    public calculateStateDifference(
        state1: GameState,
        state2: GameState,
    ): Partial<GameState> | null {
        const diffState: any = {
            players: [],
            level: {
                bounces: {},
            },
        };

        // Calculate difference for each player
        for (let i = 0; i < state1.players.length; i++) {
            const playerDiff = {
                position: {
                    x:
                        state2.players[i].position.x -
                        state1.players[i].position.x,
                    y:
                        state2.players[i].position.y -
                        state1.players[i].position.y,
                },
                velocity: {
                    x:
                        state2.players[i].velocity.x -
                        state1.players[i].velocity.x,
                    y:
                        state2.players[i].velocity.y -
                        state1.players[i].velocity.y,
                },
            };
            diffState.players.push(playerDiff);
        }

        // Calculate difference for each bounce
        for (const key in state1.level.bounces) {
            const bounceDiff = {
                rotationY:
                    state2.level.bounces[key].rotationY -
                    state1.level.bounces[key].rotationY,
            };
            diffState.level.bounces[key] = bounceDiff;
        }

        // Check if the differences are all zero
        const isZeroPlayersDiff = Object.values(diffState.players).every(
            (playerDiff: any) =>
                playerDiff.position.x === 0 &&
                playerDiff.position.y === 0 &&
                playerDiff.velocity.x === 0 &&
                playerDiff.velocity.y === 0,
        );

        const isZeroBounceDiff = Object.values(diffState.level.bounces).every(
            (bounceDiff: any) => bounceDiff.rotationY === 0,
        );

        // Return null if all differences are zero
        if (isZeroPlayersDiff && isZeroBounceDiff) {
            return null;
        }

        // Otherwise, return the diffState
        return diffState;
    }

    private applyFractionOfDiffToState(
        state: GameState,
        diff: GameState,
        ratio: number,
    ): GameState {
        // Calculate fraction of player state difference
        for (let i = 0; i < state.players.length; i++) {
            const playerDiff = diff.players[i];
            const player = state.players[i];

            player.position.x += playerDiff.position.x * ratio;
            player.position.y += playerDiff.position.y * ratio;
            player.velocity.x += playerDiff.velocity.x * ratio;
            player.velocity.y += playerDiff.velocity.y * ratio;
        }

        // Calculate fraction of bounce state difference
        for (const key in state.level.bounces) {
            const bounceDiff = diff.level.bounces[key];
            const bounceFraction = state.level.bounces[key];

            bounceFraction.rotationY += bounceDiff.rotationY * ratio;
        }

        return state;
    }

    public onAverageRttReceived = (serverTime: number, rtt: number) => {
        // rtt = 500;
        // Calculate one-way latency
        let oneWayLatency = Math.floor(rtt / 2);

        this.correctionMaxIncrement = Math.floor(
            oneWayLatency > 25 ? 25 : oneWayLatency,
        );

        // Set gameTimeDelta based on one-way latency
        this.gameTimeDelta = oneWayLatency;

        this.bufferHistorySize = this.gameTimeDelta * 1.2;

        this.gameTimeIsSynchronized = true;

        let sendInputsInterval = Math.floor(rtt / 2);
        console.log('average RTT', rtt);
        console.log('one way latency', oneWayLatency);
        // console.log('send inputs interval', sendInputsInterval);
        console.log('buffer history size', this.bufferHistorySize);
        console.log('correction max increment', this.correctionMaxIncrement);
        this.predictionState.game_time = serverTime + this.gameTimeDelta;

        // basically, this condition means if we have a socket controller
        if (this.sendInputs) {
            // Call sendBufferedInputs at regular intervals
            this.sendInputIntervalId = setInterval(() => {
                if (this.inputsToSendBuffer.length > 0) {
                    this.sendInputs!(this.inputsToSendBuffer);
                    this.inputsToSendBuffer = [];
                }
            }, sendInputsInterval) as any;
        }
    };

    public computeDisplayState = () => {
        // when we are in editor more we do not synchronize the game time
        // if there is a correction to apply, we apply it progressively
        if (this.gameTimeIsSynchronized && this.stateCorrection !== null) {
            const ratio = 1 / this.correctionMaxIncrement;
            const correctedState = this.applyFractionOfDiffToState(
                this.predictionState,
                this.stateCorrection as GameState,
                ratio,
            );

            this.correctionCounter++;
            this.predictionState = correctedState;
            if (this.correctionCounter >= this.correctionMaxIncrement) {
                this.stateCorrection = null;
                this.correctionCounter = 0;
            }
        }

        this.displayState = this.predictionState;
    };
}
