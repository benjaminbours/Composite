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
        const t = target;
        // const targetOrientation = new Quaternion()
        //     .set(rotation.x, rotation.y, rotation.z, 1)
        //     .normalize();
        // const camera = this;

        this.isFocusing = true;
        gsap.to(this.position!, {
            // delay: 1,
            duration: 2,
            x: t.x,
            y: t.y,
            overwrite: true,
        });
        // gsap.to(
        //     {},
        //     {
        //         // delay: 1,
        //         duration: 5,
        //         overwrite: true,
        //         onUpdate: function () {
        //             camera.quaternion.slerp(targetOrientation, this.progress());
        //         },
        //     },
        // );
    }

    public unfocus = () => {
        this.isFocusing = false;
        // const targetOrientation = new Quaternion().set(0, 0, 0, 1).normalize();
        // const camera = this;

        // gsap.to(
        //     {},
        //     {
        //         duration: 1,
        //         overwrite: true,
        //         onUpdate: function () {
        //             camera.quaternion.slerp(targetOrientation, this.progress());
        //         },
        //     },
        // );
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
