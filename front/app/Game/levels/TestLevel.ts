import { Group, BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import { createMeshForGrid, multiplyByGridSize } from '../Mesh/Grid';

export class TestLevel extends Group {
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
