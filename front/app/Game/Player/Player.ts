import { Object3D, Vector3, Vector2 } from 'three';
import {
    jumpIfPossible,
    applyGravity,
    applyAscension,
    moveLeft,
    moveRight,
    useVelocity,
    MovableComponentState,
    MovableComponent,
} from './physics/movementHelpers';

export class Player extends Object3D implements MovableComponent {
    // start properties used on collision systems
    public velocity = new Vector2(0, 0);
    public range = new Vector3(20, 20, 0);
    public state: MovableComponentState = MovableComponentState.onFloor;
    public currentElevator = undefined;
    public currentDoorOpener = undefined;
    public currentEndLevel = undefined;
    // + positions from Object3D
    // end properties used on collision systems

    constructor(public isMainPlayer: boolean) {
        super();
    }

    public update(delta: number) {
        if (!this.isMainPlayer) {
            return;
        }
        // possible to find a way to avoid this duplication
        moveRight(delta)(this.velocity);
        moveLeft(delta)(this.velocity);

        jumpIfPossible(this);

        if (this.state === MovableComponentState.inAir) {
            applyGravity(delta)(this.velocity);
        }

        if (this.state === MovableComponentState.ascend) {
            applyAscension(this.velocity);
        }

        useVelocity(delta, this);
    }
}
