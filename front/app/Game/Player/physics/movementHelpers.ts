import { Vector2, Vector3 } from 'three';
import * as R from 'ramda';
import { Player } from '../Player';
import Inputs from '../Inputs';
import { getNearestObjects } from './raycaster';
import { MysticPlace } from '../../elements/MysticPlace';
import { CollidingElem } from '../../types';
import { DoorOpener } from '../../elements/DoorOpener';
// import { Elevator } from '../../elements/Elevator';

const MAX_VELOCITY_X = 15;
const MAX_FALL_SPEED = 20;
const MAX_ASCEND_SPEED = 10;
const JUMP_POWER = 15;
const GRAVITY = 20;
const SPEED = 20; // less is faster

export const useVelocity = (delta: number, player: Player) => {
    player.position.x += player.velocity.x * delta * 60;
    player.position.y += player.velocity.y * delta * 60;
};

// Gravity helpers
const hasReachedMaxFallSpeed = R.propSatisfies(
    // predicate
    (y: number) => y <= -MAX_FALL_SPEED,
    // name of the key on the object that will be used, most likely it will be a velocity object, vec2 or 3
    'y',
);
const setToMaxFallSpeed = (velocity: Vector2) => (velocity.y = -MAX_FALL_SPEED);
const increaseFallSpeed = (delta: number) => (velocity: Vector2) =>
    (velocity.y -= GRAVITY * delta);

export const applyGravity = (delta: number) =>
    R.ifElse(
        hasReachedMaxFallSpeed,
        setToMaxFallSpeed,
        increaseFallSpeed(delta),
    );

// Ascension helpers
const hasReachedMaxAscendSpeed = R.propSatisfies(
    // predicate
    (y: number) => y >= MAX_ASCEND_SPEED,
    // name of the key on the object that will be used, most likely it will be a velocity object, vec2 or 3
    'y',
);
const setToMaxAscendSpeed = (velocity: Vector2) =>
    (velocity.y = MAX_ASCEND_SPEED);
const increaseAscendSpeed = (velocity: Vector2) => {
    // console.log(delta * GRAVITY);
    // return velocity.y += GRAVITY * delta;
    // console.log(velocity.y += GRAVITY / 1000);
    return (velocity.y += GRAVITY / 1000);
    // return velocity.y += GRAVITY * (delta < 0.03 ? 0.03 : delta);
};

// TODO: Inclure la distance par rapport au sol dans le calcule de la poussée vers le haut
export const applyAscension = R.ifElse(
    hasReachedMaxAscendSpeed,
    setToMaxAscendSpeed,
    increaseAscendSpeed,
);

// const maxAscensionDistance = 600;
// export function applyAscension(velocity, distanceFromFloor: number) {
//     // La velocity.y doit être égal à la distanceFromFloor divisé par...
//     // if (velocity.x >=) {

//     // }
// }

// I would like the jump feature to be like the other, just to receive a velocity, could be something else than player
// But for now, its very attached to the player state. Temporary it is fine.
// Jump helpers
const isJumpPossible = (player: Player) =>
    Inputs.jumpIsActive && player.state === MovableComponentState.onFloor;
const setToJumpPower = (player: Player) => (player.velocity.y = JUMP_POWER);

export const jumpIfPossible = R.when(isJumpPossible, setToJumpPower);

// Left / Right helpers
const hasReachedMaxLeftSpeed = (velocity: Vector2) =>
    Inputs.leftIsActive && velocity.x > -MAX_VELOCITY_X;
const hasReachedMaxRightSpeed = (velocity: Vector2) =>
    Inputs.rightIsActive && velocity.x < MAX_VELOCITY_X;
const updateVelocityX =
    (delta: number, target: number) => (velocity: Vector2) =>
        (velocity.x += (target - velocity.x) / (SPEED * delta * 60));

export const moveLeft = (delta: number) =>
    R.ifElse(
        hasReachedMaxLeftSpeed,
        updateVelocityX(delta, -MAX_VELOCITY_X),
        updateVelocityX(delta, 0),
    );

export const moveRight = (delta: number) =>
    R.ifElse(
        hasReachedMaxRightSpeed,
        updateVelocityX(delta, MAX_VELOCITY_X),
        updateVelocityX(delta, 0),
    );

export enum MovableComponentState {
    onFloor,
    inside,
    inAir,
    projected,
    ascend,
}

export interface MovableComponent {
    position: Vector3;
    range: Vector3;
    velocity: Vector2;
    state: MovableComponentState;
    // We have to keep in memory a reference to the last activated mystic place in order to deactivate it when we leave
    // currentElevator: Elevator | undefined;
    currentDoorOpener: DoorOpener | undefined;
}

export interface InteractiveComponent {
    shouldActivate: boolean;
    isActive: boolean;
}

export function collisionSystem(
    components: MovableComponent[],
    obstacles: CollidingElem[],
) {
    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        const { position, velocity, range } = component;

        const nearestObjects = getNearestObjects(position, obstacles);

        if (nearestObjects.down) {
            const { parent } = nearestObjects.down.object;

            const clearCurrentDoorOpener = () => {
                if (component.currentDoorOpener) {
                    component.currentDoorOpener.shouldActivate = false;
                    component.currentDoorOpener = undefined;
                }
            };

            // when the component touch the floor
            if (
                position.y + velocity.y <=
                range.y + nearestObjects.down.point.y
            ) {
                velocity.y = 0;
                position.y = nearestObjects.down.point.y + 20;

                switch (true) {
                    // case parent instanceof Elevator:
                    //     component.currentElevator = parent as Elevator;
                    //     (parent as Elevator).shouldActivate = true;
                    //     component.state = MovableComponentState.ascend;
                    //     break;
                    case parent instanceof DoorOpener:
                        component.currentDoorOpener = parent as DoorOpener;
                        (parent as DoorOpener).shouldActivate = true;
                        if (component.state !== MovableComponentState.onFloor) {
                            component.state = MovableComponentState.onFloor;
                        }
                        break;
                    default:
                        if (component.state !== MovableComponentState.onFloor) {
                            component.state = MovableComponentState.onFloor;
                        }
                        break;
                }
            } else {
                // when the component is not touching the floor
                // TODO: Think about how to manage the two different mystic place logics
                // the pulsing flow and the door opening
                // it should probably not stay in the collision and player logic
                // think about a system that could be apply to anything with velocity, not just the player
                // if (
                //     parent instanceof Elevator &&
                //     nearestObjects.down.distance <= parent.height
                // ) {
                //     component.currentElevator = parent;
                //     parent.shouldActivate = true;
                //     component.state = MovableComponentState.ascend;
                // } else {
                //     if (component.state !== MovableComponentState.inAir) {
                //         component.state = MovableComponentState.inAir;
                //     }
                // }
                if (component.state !== MovableComponentState.inAir) {
                    component.state = MovableComponentState.inAir;
                }

                clearCurrentDoorOpener();
            }

            // if (!(parent instanceof Elevator) && component.currentElevator) {
            //     component.currentElevator.shouldActivate = false;
            //     component.currentElevator = undefined;
            // }

            if (!(parent instanceof DoorOpener)) {
                clearCurrentDoorOpener();
            }
        }

        if (
            nearestObjects.right &&
            position.x + velocity.x + range.x > nearestObjects.right.point.x
        ) {
            velocity.x = 0;
            position.x = nearestObjects.right.point.x - 20;
        }

        if (
            nearestObjects.left &&
            position.x + velocity.x < range.x + nearestObjects.left.point.x
        ) {
            velocity.x = 0;
            position.x = nearestObjects.left.point.x + 20;
        }

        if (
            nearestObjects.up &&
            position.y + velocity.y + range.y > nearestObjects.up.point.y
        ) {
            velocity.y = 0;
            position.y = nearestObjects.up.point.y - 20;
        }
    }
}
