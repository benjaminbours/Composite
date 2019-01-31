import {
    Object3D,
    Vector3,
    Clock,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
} from "three";
import Inputs from "./Inputs";

type PlayerState = "onFloor" | "inside" | "inAIr" | "projected";

export default class Player extends Object3D {
    private rays = [
        new Vector3(1, 0, 0),
        new Vector3(-1, 0, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, -1, 0),
    ];

    private state: PlayerState = "onFloor";

    private velocityTarget = {
        x: 15,
    };

    private velocity = {
        x: 0,
        y: 0,
    };

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

    public render = () => {
        this.delta = this.clock.getDelta() / 2;
        this.deltaInverse = (1 / this.delta) / (60 * 60);

        if (this.state === "onFloor") {
            this.canGoLeft();
            this.canGoRight();
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

    private updateVelocity = (target: number) => {
        // TODO: explain what is this calcul
        this.velocity.x += (target - this.velocity.x) / ((this.speed * this.deltaInverse) * 60);
    }

    private jump = () => {
        //
    }

    private useVelocity = () => {
        // this.position.y += Player.calcSpeed(this.delta, this.velocity.y);
        this.position.x += (this.velocity.x * this.deltaInverse) * 60;
    }
}
