import { PerspectiveCamera, Vector2, Vector3 } from 'three';

export default class CustomCamera extends PerspectiveCamera {
    public distanceToTarget: number = 0;

    constructor(fov: number, aspectRatio: number, near: number, far: number) {
        super(fov, aspectRatio, near, far);
    }

    public update = (vector: Vector3, followSpeed: number) => {
        this.position.y += (vector.y + 10 - this.position.y) / followSpeed;
        this.position.x += (vector.x - this.position.x) / followSpeed;
    };
}
