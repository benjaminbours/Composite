// vendors
import { Scene, Vector3 } from 'three';
// our libs
import { Levels } from '@benjaminbours/composite-core';
// local
import { LightPlayer, ShadowPlayer, Player } from '../Player';
import { PositionLevelWithGraphic } from './PositionLevelWithGraphic';
import { ProjectionLevelWithGraphic } from './ProjectionLevelWithGraphic';

export default class LevelController {
    public levels: {
        [Levels.CRACK_THE_DOOR]: PositionLevelWithGraphic;
        [Levels.LEARN_TO_FLY]: ProjectionLevelWithGraphic;
        [Levels.THE_HIGH_SPHERES]?: PositionLevelWithGraphic;
    };

    constructor(public currentLevel: Levels) {
        // TODO: Could use dynamic import to load level code only when needed
        this.levels = {
            [Levels.CRACK_THE_DOOR]: new PositionLevelWithGraphic(),
            [Levels.LEARN_TO_FLY]: new ProjectionLevelWithGraphic(),
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
        // this line is the best to visualize what the server see when loading the level
        // scene.add(...this.levels[level]!.collidingElements);
    };
}
