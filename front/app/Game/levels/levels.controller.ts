// vendors
import { Scene, Vector3 } from 'three';
// our libs
import { Levels, ProjectionLevel } from '@benjaminbours/composite-core';
// local
import { LightPlayer, ShadowPlayer, Player } from '../Player';
import { PositionLevelWithGraphic } from './PositionLevelWithGraphic';

export default class LevelController {
    public levels: {
        [Levels.CRACK_THE_DOOR]: PositionLevelWithGraphic;
        [Levels.LEARN_TO_FLY]: ProjectionLevel;
        [Levels.THE_HIGH_SPHERES]?: PositionLevelWithGraphic;
    };

    constructor(public currentLevel: Levels) {
        // TODO: Could use dynamic import to load level code only when needed
        this.levels = {
            // [Levels.]: new TestLevel(),
            [Levels.CRACK_THE_DOOR]: new PositionLevelWithGraphic(),
            [Levels.LEARN_TO_FLY]: new ProjectionLevel(),
        };
    }

    loadLevel = (level: Levels, scene: Scene, players: Player[]) => {
        // unmount from scene the previously mounted level
        if (this.currentLevel) {
            scene.remove(this.levels[this.currentLevel]!);
        }
        // mount the new one
        this.currentLevel = level;
        scene.add(this.levels[level]!);
    };
}
