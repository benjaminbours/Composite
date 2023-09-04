import { Group, BoxGeometry, MeshBasicMaterial, Mesh, Vector3 } from 'three';
import { CollidingElem } from '../types';
import { createMeshForGrid, multiplyByGridSize } from './levels.utils';

export class TestLevel extends Group {
    public collidingElements: CollidingElem[] = [];
    public name = 'test-level';

    public startPosition = {
        light: new Vector3(10, 20, 0),
        shadow: new Vector3(15, 20, 0),
    };

    constructor() {
        super();

        // const geometry = new BoxGeometry(250, 250, 250);
        // const material = new MeshBasicMaterial({ color: 0x00ff00 });
        // const wall = new Mesh(geometry, material);

        // test purpose
        const geometry = new BoxGeometry(
            multiplyByGridSize(1),
            multiplyByGridSize(1),
            multiplyByGridSize(1),
        );
        const material = new MeshBasicMaterial({ color: 0xffff00 });
        const sizeBox = createMeshForGrid(geometry, material);
        // this.add(wall);
        this.add(sizeBox);
    }
}
