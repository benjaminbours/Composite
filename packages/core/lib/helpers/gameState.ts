import { Vector2, Vector3 } from 'three';
import { LevelMapping } from '../levels/LevelMapping';
import { GameState } from '../GameState';
import { MovableComponentState } from '../types';
import { gridSize } from '../levels';

// partial implementation copied from db level
interface Level {
    id: number;
    data: any;
    lightStartPosition: number[];
    shadowStartPosition: number[];
}

export function createInitialGameStateAndLevelMapping(level: Level) {
    const levelMapping = new LevelMapping(level.id, level.data as any[], {
        light: new Vector3(
            level.lightStartPosition[0],
            level.lightStartPosition[1] === 0
                ? 0.08
                : level.lightStartPosition[1],
            level.lightStartPosition[2],
        ).multiplyScalar(gridSize),
        shadow: new Vector3(
            level.shadowStartPosition[0],
            level.shadowStartPosition[1] === 0
                ? 0.08
                : level.shadowStartPosition[1],
            level.shadowStartPosition[2],
        ).multiplyScalar(gridSize),
    });

    const initialGameState = new GameState(
        [
            {
                position: new Vector2(
                    levelMapping.startPosition.shadow.x,
                    levelMapping.startPosition.shadow.y,
                ),
                velocity: new Vector2(0, 0),
                state: MovableComponentState.inAir,
                insideElementID: undefined,
            },
            {
                position: new Vector2(
                    levelMapping.startPosition.light.x,
                    levelMapping.startPosition.light.y,
                ),
                velocity: new Vector2(0, 0),
                state: MovableComponentState.inAir,
                insideElementID: undefined,
            },
        ],
        levelMapping.state,
        0,
        0,
    );

    return { levelMapping, initialGameState };
}
