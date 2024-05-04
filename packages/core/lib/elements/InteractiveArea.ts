// vendors
import { BoxGeometry, Mesh } from 'three';
// our libs
import { gridSize, materials } from '../levels/levels.utils';
import { Layer } from '../types';

export class InteractiveArea extends Mesh {
    constructor(public name: string) {
        const geometry = new BoxGeometry(gridSize / 2, 10, gridSize / 2);
        super(geometry, materials.phong);
        this.layers.enable(Layer.BLOOM);
        this.layers.enable(Layer.OCCLUSION_PLAYER);
    }
}
