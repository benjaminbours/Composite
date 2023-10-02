// vendors
import {
    BoxGeometry,
    DoubleSide,
    Mesh,
    MeshPhongMaterial,
    Object3D,
} from 'three';
// our libs
import { gridSize } from '../levels/levels.utils';

export class InteractiveArea extends Object3D {
    constructor(public name: string) {
        super();
        const geometry = new BoxGeometry(gridSize / 2, 10, gridSize / 2);
        const material = new MeshPhongMaterial({
            color: 0xffffff,
            side: DoubleSide,
            specular: 0x000000,
            shininess: 50,
            transparent: true,
        });

        const whiteBlock = new Mesh(geometry, material);
        this.add(whiteBlock);
    }
}
