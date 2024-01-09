import { Camera, Mesh, Vector3 } from 'three';
import { Side } from '../types';
import { getCenterPoint } from '../levels';
import { degreesToRadians } from '../helpers/math';

export class ElementToBounce extends Mesh {
    public bounce = true;

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
        // TODO: Try to optimize and save the center somewhere to avoid useless recomputation
        const p = getCenterPoint(this);
        const vector = p.project(camera);
        const x = (vector.x + 1) / 2;
        const y = (vector.y + 1) / 2;
        return new Vector3(x, y);
    };

    public update = (rotationY: number) => {
        this.rotation.y = degreesToRadians(rotationY);
    };
}
