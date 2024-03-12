import { Group, Object3D, Object3DEventMap, Vector3 } from 'three';
import { LevelState } from '../GameState';
import {
    AbstractLevel,
    WorldContext,
    addToCollidingElements,
    parseLevelElements,
} from './levels.utils';
import { ElementToBounce } from '../elements';

export class LevelMapping extends Group implements AbstractLevel {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public bounces: ElementToBounce[] = [];
    public lightBounces: ElementToBounce[] = [];

    public startPosition = {
        light: new Vector3(10, 20), // start level
        shadow: new Vector3(200, 20, 0),
    };

    public state: LevelState;

    public doors: {
        wall: Object3D<Object3DEventMap>;
        openerPosition: Vector3;
    }[] = [];

    constructor(id: number, data: any[]) {
        super();
        this.state = {
            id,
            doors: {},
            bounces: {},
            end_level: [],
        };

        const worldContext: WorldContext = {
            levelState: this.state,
            bounceList: this.bounces,
        };
        const elements = parseLevelElements(worldContext, data);

        for (let i = 0; i < elements.length; i++) {
            const { mesh } = elements[i];
            this.add(mesh);
            addToCollidingElements(mesh, this.collidingElements);
        }
    }
}
