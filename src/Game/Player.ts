import {
    Object3D,
    Vector3,
    Clock,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
} from "three";
import * as R from "ramda";
import Inputs from "./Inputs";
import Collider from "./Collider";
import { ArrCollidingElem } from "./types";

type PlayerState = "onFloor" | "inside" | "inAir" | "projected";

const MAX_FALL_SPEED = -20;
const GRAVITY = 30;
const CLOCK = new Clock();
let delta = CLOCK.getDelta();

// gravity helpers
const hasReachedMaxFallSpeed = R.propSatisfies(
    (y) => y <= MAX_FALL_SPEED,
    "y",
);
const setToMaxFallSpeed = (value) => value.y = MAX_FALL_SPEED;
const increaseFallSpeed = (velocity) => velocity.y -= GRAVITY * delta;

const applyGravity = R.ifElse(
    hasReachedMaxFallSpeed,
    setToMaxFallSpeed,
    increaseFallSpeed,
);

export default class Player extends Object3D {
    public velocity = {
        x: 0,
        y: 0,
    };

    public range = new Vector3(20, 21, 0);
    public state: PlayerState = "onFloor";

    private velocityTarget = {
        x: 15,
    };

    private speed = 20;

    constructor() {
        super();

        const geometry = new SphereGeometry(5, 32, 32);
        const material = new MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new Mesh(geometry, material);
        this.add(sphere);
    }

    public render = (obstacles: ArrCollidingElem) => {
        delta = CLOCK.getDelta();

        Collider.detectCollision(this, obstacles);
        this.handleCollision();

        this.canGoLeft();
        this.canGoRight();
        if (this.state === "onFloor") {
            this.canJump();
        }
        if (this.state === "inAir") {
            applyGravity(this.velocity);
        }

        this.useVelocity();
    }

    private canGoLeft = () => {
        if (Inputs.leftIsActive) {
            if (this.velocity.x > -this.velocityTarget.x) {
                this.updateVelocity(-this.velocityTarget.x);
            }
        } else {
            this.updateVelocity(0);
        }
    }

    private canGoRight = () => {
        if (Inputs.rightIsActive) {
            if (this.velocity.x < this.velocityTarget.x) {
                this.updateVelocity(this.velocityTarget.x);
            }
        } else {
            this.updateVelocity(0);
        }
    }

    private canJump = () => {
        if (Inputs.jumpIsActive) {

            if (this.state === "onFloor") {
                this.velocity.y = 20;
            }
        }
    }

    private updateVelocity = (target: number) => {
        // TODO: explain what is this calcul
        this.velocity.x += (target - this.velocity.x) / ((this.speed * delta) * 60);
    }

    private useVelocity = () => {
        this.position.x += (this.velocity.x * delta) * 60;
        this.position.y += (this.velocity.y * delta) * 60;
    }

    private handleCollision = () => {
        if (Collider.nearestObjects.down) {
            if (this.state !== "onFloor") {
                this.state = "onFloor";
            }
            this.velocity.y = 0;
            this.position.y = Collider.nearestObjects.down.point.y + 20;
        } else {
            if (this.state !== "inAir") {
                this.state = "inAir";
            }
        }

        if (Collider.nearestObjects.right) {
            this.velocity.x = 0;
            this.position.x = Collider.nearestObjects.right.point.x - 20;
        }

        if (Collider.nearestObjects.left) {
            this.velocity.x = 0;
            this.position.x = Collider.nearestObjects.left.point.x + 20;
        }
    }
}
