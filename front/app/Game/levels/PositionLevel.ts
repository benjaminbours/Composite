import { Group, BoxGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three';
import { createWall } from './levels.utils';
import { CollidingElem } from '../types';

export class PositionLevel extends Group {
    public collidingElements: CollidingElem[] = [];

    constructor() {
        super();

        const wallBlockingLeftPath = createWall(
            new Vector3(3, 2, 0),
            new Vector3(-2, 0, 1),
            new Vector3(0, 90, 0),
        );
        this.add(wallBlockingLeftPath);
        this.collidingElements.push(wallBlockingLeftPath);
    }
}
