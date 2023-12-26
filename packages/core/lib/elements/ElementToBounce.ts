import { Camera, Mesh, Vector3 } from 'three';
import { Side } from '../types';

export class ElementToBounce extends Mesh {
    public bounce = true;

    constructor(geometry: any, material: any, public side: Side) {
        super(geometry, material);
    }

    // TODO: Rename this function, its unclear
    // TODO: Duplicate function with player
    public get2dPosition = (camera: Camera) => {
        const p = this.position.clone();
        const vector = p.project(camera);
        const x = (vector.x + 1) / 2;
        const y = (vector.y + 1) / 2;
        return new Vector3(x, y);
    };
}
