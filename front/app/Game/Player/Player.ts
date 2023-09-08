import {
    Object3D,
    Vector3,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector2,
} from 'three';
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
    // + positions from Object3D
    // end properties used on collision systems

    public mesh: Mesh;

    constructor() {
        super();

        const geometry = new SphereGeometry(5, 32, 32);
        const material = new MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new Mesh(geometry, material);
        this.add(this.mesh);
    }

    // TODO: When we create a second player, we don't want this update function to run, its meaningful only for the playing one
    public update = (delta: number) => {
        // possible to find a way to avoid this duplication
        moveRight(delta)(this.velocity);
        moveLeft(delta)(this.velocity);

        jumpIfPossible(this);

        if (this.state === MovableComponentState.inAir) {
            applyGravity(delta)(this.velocity);
        }

        if (this.state === MovableComponentState.ascend) {
            applyAscension(this.velocity);
            // applyAscension(this.velocity, this.distanceFromFloor);
        }

        useVelocity(delta, this);
    };
}
