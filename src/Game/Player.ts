import {
    Object3D,
    Vector3,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
} from "three";
import { detectPlayerCollision, INearestObjects } from "./Physics/collider";
import { ArrCollidingElem } from "./types";
import { jumpIfPossible, applyGravity, updateDelta, moveLeft, moveRight, useVelocity } from "./Physics/movementHelpers";

type PlayerState = "onFloor" | "inside" | "inAir" | "projected";

export default class Player extends Object3D {
    public velocity = {
        x: 0,
        y: 0,
    };

    public range = new Vector3(20, 21, 0);
    public state: PlayerState = "onFloor";

    constructor() {
        super();

        const geometry = new SphereGeometry(5, 32, 32);
        const material = new MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new Mesh(geometry, material);
        this.add(sphere);
    }

    public render = (obstacles: ArrCollidingElem) => {
        updateDelta();
        const nearestObjects = detectPlayerCollision(this, obstacles);
        this.handleCollision(nearestObjects);

        // maybe possible to find a way to avoid this duplication
        moveRight(this.velocity);
        moveLeft(this.velocity);

        jumpIfPossible(this);

        if (this.state === "inAir") {
            applyGravity(this.velocity);
        }

        useVelocity(this);
    }

    // mutate value
    private handleCollision = (nearestObjects: INearestObjects) => {
        if (nearestObjects.down) {
            if (this.state !== "onFloor") {
                this.state = "onFloor";
            }
            this.velocity.y = 0;
            this.position.y = nearestObjects.down.point.y + 20;
        } else {
            if (this.state !== "inAir") {
                this.state = "inAir";
            }
        }

        if (nearestObjects.right) {
            this.velocity.x = 0;
            this.position.x = nearestObjects.right.point.x - 20;
        }

        if (nearestObjects.left) {
            this.velocity.x = 0;
            this.position.x = nearestObjects.left.point.x + 20;
        }
    }
}
