import { Group, Object3D, Object3DEventMap, Vector3 } from 'three';
import { LevelState } from '../GameState';
import {
    AbstractLevel,
    ClientGraphicHelpers,
    WorldContext,
    addToCollidingElements,
    parseLevelElements,
} from './levels.utils';
import { ElementToBounce } from '../elements';

export interface LevelStartPosition {
    light: Vector3;
    shadow: Vector3;
}

export class LevelMapping extends Group implements AbstractLevel {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public bounces: ElementToBounce[] = [];
    public lightBounces: ElementToBounce[] = [];

    public state: LevelState;

    public doors: {
        wall: Object3D<Object3DEventMap>;
        openerPosition: Vector3;
    }[] = [];

    constructor(
        id: number,
        data: any[],
        public startPosition: LevelStartPosition,
        clientGraphicHelpers?: ClientGraphicHelpers,
    ) {
        super();
        this.name = `level_${id}`;
        this.state = {
            id,
            doors: {},
            bounces: {},
            end_level: [],
        };

        const worldContext: WorldContext = {
            levelState: this.state,
            bounceList: this.bounces,
            clientGraphicHelpers,
        };
        const elements = parseLevelElements(worldContext, data);

        for (let i = 0; i < elements.length; i++) {
            const { mesh } = elements[i];
            this.add(mesh);
            addToCollidingElements(mesh, this.collidingElements);
        }
    }
}
