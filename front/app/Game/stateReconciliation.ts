import {
    Context,
    GamePlayerInputPayload,
    GameState,
    Side,
    applyInputListToSimulation,
} from '@benjaminbours/composite-core';
import { Object3D, Object3DEventMap } from 'three';

export function stateReconciliation(
    inputsHistory: GamePlayerInputPayload[],
    predictionStateTime: number,
    serverState: GameState,
    side: Side,
    lastServerInputs: [
        GamePlayerInputPayload | undefined,
        GamePlayerInputPayload | undefined,
    ],
    collidingElements: Object3D<Object3DEventMap>[],
    physicDelta: number,
) {
    // TODO: With a good diff check, its still probably possible to optimize and avoid useless
    // state reconciliation. But it means to restore other player prediction maybe.
    const nextPredictionHistory: GameState[] = [serverState];
    let gameTime = serverState.game_time;
    while (gameTime < predictionStateTime) {
        gameTime++;
        const nextState = JSON.parse(
            JSON.stringify(
                nextPredictionHistory[nextPredictionHistory.length - 1],
            ),
        );
        nextState.game_time++;
        // find inputs for this game time
        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
            const localInputsForTick = (() => {
                if (playerIndex === side) {
                    return inputsHistory.filter(
                        ({ sequence }) => sequence == nextState.game_time,
                    );
                }
                return [];
            })();
            lastServerInputs[playerIndex] = applyInputListToSimulation(
                physicDelta,
                lastServerInputs[playerIndex],
                localInputsForTick,
                collidingElements,
                nextState,
                Context.client,
                false,
                Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
            );
            // remove inputs already processed
            for (let i = 0; i < localInputsForTick.length; i++) {
                const input = localInputsForTick[i];
                inputsHistory.splice(inputsHistory.indexOf(input), 1);
            }
        }
        nextPredictionHistory.push(nextState);
    }

    return nextPredictionHistory;
}
