import { PerspectiveCamera, Vector3 } from 'three';

export default class CustomCamera extends PerspectiveCamera {
    public defaultTarget?: Vector3;
    public target?: Vector3;

    constructor(fov: number, aspectRatio: number, near: number, far: number) {
        super(fov, aspectRatio, near, far);
    }

    public setDefaultTarget(target: Vector3) {
        this.defaultTarget = target;
    }

    public setTarget(target: Vector3 | undefined) {
        this.target = target;
    }

    // TODO: Improve camera transition / animation
    public update = (followSpeed: number) => {
        if (!this.defaultTarget) {
            return;
        }
        const target = this.target ? this.target : this.defaultTarget;
        this.position.y += (target.y + 10 - this.position.y) / followSpeed;
        this.position.x += (target.x - this.position.x) / followSpeed;
    };
}
