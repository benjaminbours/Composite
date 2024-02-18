// vendors
import { BoxGeometry, DoubleSide, Mesh, MeshPhongMaterial } from 'three';
// our libs
import { gridSize } from '../levels/levels.utils';

export class InteractiveArea extends Mesh {
    constructor(public name: string) {
        const geometry = new BoxGeometry(gridSize / 2, 10, gridSize / 2);
        const material = new MeshPhongMaterial({
            color: 0xffffff,
            side: DoubleSide,
            specular: 0x000000,
            shininess: 50,
            transparent: true,
        });
        super(geometry, material);
    }
}
