import { Camera, Mesh, Vector3 } from 'three';
import { Side } from '../types';
import { degreesToRadians } from '../helpers/math';

export class ElementToBounce extends Mesh {
    public bounce = true;
    public center = new Vector3();

    constructor(
        geometry: any,
        material: any,
        public side: Side,
        public bounceID: number,
    ) {
        super(geometry, material);
    }

    // TODO: Rename this function, its unclear
    // TODO: Duplicate function with player
    public get2dPosition = (camera: Camera) => {
        const vector = this.localToWorld(this.center.clone()).project(camera);
        const x = (vector.x + 1) / 2;
        const y = (vector.y + 1) / 2;
        return new Vector3(x, y);
    };

    public update = (rotationY: number) => {
        this.rotation.y = degreesToRadians(rotationY);
    };
}
