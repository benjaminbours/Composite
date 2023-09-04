import {
    Group,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Scene,
    Vector2,
    Vector3,
} from 'three';
import { TestLevel } from './TestLevel';
import { PositionLevel } from './PositionLevel';
import { CollidingElem, Geometries } from '../types';
import { gridSize } from './levels.utils';
import { LightPlayer, Player } from '../Player';

type Level = 'testLevel' | 'positionLevel';

export default class LevelController {
    public currentLevel?: Level;
    public levels: {
        testLevel: TestLevel;
        positionLevel: PositionLevel;
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

    constructor() {
        // TODO: Could use dynamic import to load level code only when needed
        this.levels = {
            testLevel: new TestLevel(),
            positionLevel: new PositionLevel(),
        };
    }

    loadLevel = (level: Level, scene: Scene, players: Player[]) => {
        // unmount from scene the previously mounted level
        if (this.currentLevel) {
            scene.remove(this.levels[this.currentLevel]);
        }
        // mount the new one
        this.currentLevel = level;
        scene.add(this.levels[level]);

        // set position of the players
        players.forEach((player) => {
            if (player instanceof LightPlayer) {
                const position = this.levels[level].startPosition.light;
                player.position.set(position.x, position.y, position.z);
            }
        });
    };
}
