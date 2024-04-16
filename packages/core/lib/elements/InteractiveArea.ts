// vendors
import { BoxGeometry, Mesh } from 'three';
// our libs
import { gridSize, materials } from '../levels/levels.utils';

export class InteractiveArea extends Mesh {
    constructor(public name: string) {
        const geometry = new BoxGeometry(gridSize / 2, 10, gridSize / 2);
        super(geometry, materials.phong);
    }
}
