import {
    Object3D,
    Vector3,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector2,
} from 'three';
import { getNearestObjects, INearestObjects } from './physics/raycaster';
import { CollidingElem } from '../types';
import {
    jumpIfPossible,
    applyGravity,
    applyAscension,
    updateDelta,
    moveLeft,
    moveRight,
    useVelocity,
    delta,
} from './physics/movementHelpers';
import { MysticPlace } from '../Elements/MysticPlace';

// TODO: Can optimize with an enum
type PlayerState = 'onFloor' | 'inside' | 'inAir' | 'projected' | 'ascend';

export default class Player extends Object3D {
    public velocity = new Vector2(0, 0);

    public range = new Vector3(20, 20, 0);
    public state: PlayerState = 'onFloor';

    private currentMysticPlace: MysticPlace | undefined;
    private distanceFromFloor: number = 0;

    constructor() {
        super();

        const geometry = new SphereGeometry(5, 32, 32);
        const material = new MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new Mesh(geometry, material);
        this.add(sphere);
    }

    public render = (obstacles: CollidingElem[]) => {
        updateDelta();
        const nearestObjects = getNearestObjects(this, obstacles);
        this.handleCollision(nearestObjects);

        // maybe possible to find a way to avoid this duplication
        moveRight(this.velocity);
        moveLeft(this.velocity);

        jumpIfPossible(this);

        if (this.state === 'inAir') {
            applyGravity(this.velocity);
        }

        if (this.state === 'ascend') {
            applyAscension(this.velocity);
            // applyAscension(this.velocity, this.distanceFromFloor);
        }

        useVelocity(this);
        // console.log(this.state);
    };

    // mutate value
    private handleCollision = (nearestObjects: INearestObjects) => {
        if (nearestObjects.down) {
            const { parent } = nearestObjects.down.object;

            // console.log(nearestObjects.down);

            // when the player touch the floor
            if (
                this.position.y + this.velocity.y <
                this.range.y + nearestObjects.down.point.y
            ) {
                this.velocity.y = 0;
                this.position.y = nearestObjects.down.point.y + 20;

                if (parent instanceof MysticPlace) {
                    this.currentMysticPlace = parent;
                    parent.playerIsOn = true;
                    this.state = 'ascend';
                } else {
                    if (this.state !== 'onFloor') {
                        this.state = 'onFloor';
                    }
                }
            } else {
                // when the player is not toucher the floor
                // if (parent instanceof MysticPlace) {
                if (
                    parent instanceof MysticPlace &&
                    nearestObjects.down.distance <= 600
                ) {
                    this.currentMysticPlace = parent;
                    parent.playerIsOn = true;
                    this.state = 'ascend';
                } else {
                    if (this.state !== 'inAir') {
                        this.state = 'inAir';
                    }
                }
            }

            if (!(parent instanceof MysticPlace) && this.currentMysticPlace) {
                this.currentMysticPlace.playerIsOn = false;
                this.currentMysticPlace = undefined;
                console.log('out');
            }

            this.distanceFromFloor = nearestObjects.down.distance;
        }

        if (
            nearestObjects.right &&
            this.position.x + this.velocity.x + this.range.x >
                nearestObjects.right.point.x
        ) {
            this.velocity.x = 0;
            this.position.x = nearestObjects.right.point.x - 20;
        }

        if (
            nearestObjects.left &&
            this.position.x + this.velocity.x <
                this.range.x + nearestObjects.left.point.x
        ) {
            this.velocity.x = 0;
            this.position.x = nearestObjects.left.point.x + 20;
        }
    };
}
