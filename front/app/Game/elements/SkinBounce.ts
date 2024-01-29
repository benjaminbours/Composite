import { Object3D, ArrowHelper, Vector3 } from 'three';
import { ElementToBounce, Side } from '@benjaminbours/composite-core';

export class SkinBounce extends Object3D {
    public directionHelper: ArrowHelper;
    public isPlayerInside = false;

    constructor(public bounce: ElementToBounce) {
        super();
        this.name = `skin-bounce-${bounce.bounceID}`;

        const dir = new Vector3(0, 0, -1);
        dir.normalize();
        const length = 75;
        let hex = 0xffffff;
        if (bounce.side === Side.SHADOW) {
            hex = 0x000000;
        }

        // this arrow is added and removed from the scene depending if the player is inside or not
        this.directionHelper = new ArrowHelper(
            dir,
            this.bounce.center,
            length,
            hex,
            25,
        );
        (this.directionHelper as any).collidable = false;
        this.position.copy(bounce.position);
        this.rotation.copy(bounce.rotation);
    }

    update() {
        this.rotation.copy(this.bounce.rotation);
    }
}
