import {
    Object3D,
    Vector3,
    Clock,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
} from "three";
import Inputs from "./Inputs";
import Collider from "./Collider";
import { ArrCollidingElem } from "./types";

type PlayerState = "onFloor" | "inside" | "inAir" | "projected";

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

    private gravity = 0.6;

    private speed = 20;

    private clock = new Clock();
    private delta = this.clock.getDelta() / 2;
    private deltaInverse = (1 / this.delta) / (60 * 60);

    constructor() {
        super();

        const geometry = new SphereGeometry(5, 32, 32);
        const material = new MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new Mesh(geometry, material);
        this.add(sphere);
    }

    public render = (obstacles: ArrCollidingElem) => {
        this.delta = this.clock.getDelta() / 2;
        this.deltaInverse = (1 / this.delta) / (60 * 60);

        Collider.detectCollision(this, obstacles);
        this.handleCollision();

        this.canGoLeft();
        this.canGoRight();
        if (this.state === "onFloor") {
            this.canJump();
        }
        if (this.state === "inAir") {
            this.useGravity();
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
        this.velocity.x += (target - this.velocity.x) / ((this.speed * this.deltaInverse) * 60);
    }

    private useVelocity = () => {
        this.position.x += (this.velocity.x * this.deltaInverse) * 60;
        this.position.y += (this.velocity.y * this.deltaInverse) * 60;
    }

    private useGravity = () => {
        // set maximal down speed
        if (this.velocity.y <= -20) {
            this.velocity.y = -20;
        } else {
            this.velocity.y -= (this.gravity * this.delta) * 60;
        }
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
        console.log(this.state);
    }
}
