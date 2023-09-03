import { Group, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { gridSize } from '../Mesh/Grid';
import { TestLevel } from './TestLevel';
import { PositionLevel } from './PositionLevel';
import { CollidingElem, Geometries } from '../types';

export default class LevelController {
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

    constructor(collidingElements: CollidingElem[]) {
        // TODO: Could use dynamic import to load level code only when needed
        this.levels = {
            testLevel: new TestLevel(),
            positionLevel: new PositionLevel(collidingElements),
        };
    }
}
