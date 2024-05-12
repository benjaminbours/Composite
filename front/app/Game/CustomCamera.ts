import { PerspectiveCamera, Vector3 } from 'three';
import { gsap } from 'gsap';

export default class CustomCamera extends PerspectiveCamera {
    public defaultTarget!: Vector3;
    private isFocusing = false;

    constructor(fov: number, aspectRatio: number, near: number, far: number) {
        super(fov, aspectRatio, near, far);
    }

    public setDefaultTarget(target: Vector3) {
        this.defaultTarget = target;
    }

    public focusTarget(target: Vector3, rotation: Vector3) {
        this.isFocusing = true;
        gsap.to(this.position!, {
            duration: 2,
            x: target.x,
            y: target.y,
            overwrite: true,
        });
    }

    public unfocus = () => {
        this.isFocusing = false;
    };

    public update = () => {
        if (!this.isFocusing) {
            gsap.to(this.position!, {
                duration: 0.5,
                x: this.defaultTarget!.x,
                y: this.defaultTarget!.y + 10,
            });
        }
    };
}
