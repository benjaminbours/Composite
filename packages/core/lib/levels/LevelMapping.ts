import {
    BufferGeometry,
    Group,
    Mesh,
    Object3D,
    Object3DEventMap,
    Vector3,
} from 'three';
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
    public bounces: ElementToBounce[] = [];
    public doorOpeners: Object3D[] = [];
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
        patch?: (bufferGeo: BufferGeometry, mesh: Mesh) => void,
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
            doorOpenersList: this.doorOpeners,
            bounceList: this.bounces,
            clientGraphicHelpers,
        };
        if (patch) {
            patch(BufferGeometry.prototype, Mesh.prototype);
        }
        const elements = parseLevelElements(worldContext, data);

        for (let i = 0; i < elements.length; i++) {
            const { mesh } = elements[i];
            this.add(mesh);
            addToCollidingElements(mesh, this.collidingElements);
        }
    }
}
