// vendors
import {
    Group,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Scene,
    Vector2,
    Vector3,
} from 'three';
// our libs
import { Levels } from '@benjaminbours/composite-core';
// local
import { TestLevel } from './TestLevel';
import { PositionLevel } from './PositionLevel';
import { CollidingElem, Geometries } from '../types';
import { gridSize } from './levels.utils';
import { LightPlayer, ShadowPlayer, Player } from '../Player';

export default class LevelController {
    public levels: {
        // testLevel: TestLevel;
        [Levels.CRACK_THE_DOOR]: PositionLevel;
        [Levels.LEARN_TO_FLY]?: PositionLevel;
        [Levels.THE_HIGH_SPHERES]?: PositionLevel;
    };
    public geometries: {
        [key in Geometries]?: unknown | BoxGeometry;
        // border: BoxGeometry;
        // platform: BoxGeometry;
        // wall?: unknown;
    } = {
        border: new BoxGeometry(100, 10, 100),
        platform: new BoxGeometry(gridSize * 0.65, 10, gridSize * 2.5),
    };

    constructor(public currentLevel: Levels) {
        // TODO: Could use dynamic import to load level code only when needed
        this.levels = {
            // [Levels.]: new TestLevel(),
            [Levels.CRACK_THE_DOOR]: new PositionLevel(),
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

        // set position of the players
        players.forEach((player) => {
            const position = (() => {
                if (player instanceof LightPlayer) {
                    return this.levels[level]!.startPosition.light;
                }
                if (player instanceof ShadowPlayer) {
                    return this.levels[level]!.startPosition.shadow;
                }
                return new Vector3();
            })();
            player.position.set(position.x, position.y, position.z);
        });
    };
}
