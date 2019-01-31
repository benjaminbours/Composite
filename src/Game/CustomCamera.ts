import { PerspectiveCamera, Vector2, Vector3 } from "three";

export default class CustomCamera extends PerspectiveCamera {
    public playerPosition = new Vector2();

    constructor(fov: number, aspectRatio: number, near: number, far: number) {
        super(fov, aspectRatio, near, far);

        // this.lookAt(new Vector3(0, 75, 0));
    }

    public setCameraPosition = (vector: Vector3, followSpeed: number) => {
        // const disYFromPlayer = 80;
        this.position.y += (vector.y + 10 - this.position.y) / followSpeed;
        this.position.x += (vector.x - this.position.x) / followSpeed;
    }
}
