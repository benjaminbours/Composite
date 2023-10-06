import type { Intersection, Object3D, Vec2 } from 'three';
import { MovableComponent, MovableComponentState, Side } from '../types';
import { getNearestObjects } from './raycaster';
import { LevelState } from '../GameState';
import { AREA_DOOR_OPENER_SUFFIX } from '../levels';

const RANGE = 20;

const isTouchingTheFloor = (
    position: Vec2,
    velocity: Vec2,
    objectDown: Intersection,
) => position.y + velocity.y <= RANGE + objectDown.point.y;

const isTouchingDoorOpener = (objectDown: Intersection) => {
    const { parent } = objectDown.object;
    return parent?.name.includes(AREA_DOOR_OPENER_SUFFIX) || false;
};

const activateDoorOpener = (state: LevelState, objectDown: Intersection) => {
    const elem = objectDown.object.parent as Object3D;
    const doorName = `${elem.name.replace(AREA_DOOR_OPENER_SUFFIX, '')}`;
    // side effect
    state[`${doorName}_door` as keyof LevelState] = 1;
    // console.log('activate', `${doorName}_door`);
};

const clearDoorOpener = (
    players: MovableComponent[],
    side: Side,
    levelState: LevelState,
    obstacles: Object3D[],
) => {
    // check in the state if there is any door activated
    for (const key in levelState) {
        const doorIsActivated =
            key.includes('door') && levelState[key as keyof LevelState] === 1;
        // if not do nothing
        if (!doorIsActivated) {
            continue;
        }
        // if yes, check if the other players are activating this very door
        const doorName = key.replace('_door', '');
        const others = players.filter((_, index) => index !== side);
        const isActivatedByOther = others.some((otherPlayer) => {
            const nearestObjectsOtherPlayer = getNearestObjects(
                otherPlayer.position,
                obstacles,
            );
            return (
                nearestObjectsOtherPlayer.down &&
                isTouchingTheFloor(
                    otherPlayer.position,
                    otherPlayer.velocity,
                    nearestObjectsOtherPlayer.down,
                ) &&
                isTouchingDoorOpener(nearestObjectsOtherPlayer.down) &&
                nearestObjectsOtherPlayer.down.object.parent!.name.includes(
                    doorName,
                )
            );
        });

        // if yes do nothing
        if (isActivatedByOther) {
            // console.log('other player on it, stay active', key);
            continue;
        }

        // if not deactivate it
        // side effect
        levelState[key as keyof LevelState] = 0;
        // console.log('deactivate', key);
    }
};

export function collisionSystem(
    players: MovableComponent[],
    side: Side,
    levelState: LevelState,
    obstacles: Object3D[],
): MovableComponentState {
    let state: MovableComponentState = MovableComponentState.onFloor;
    const { position, velocity } = players[side];

    const nearestObjects = getNearestObjects(position, obstacles);

    if (nearestObjects.down) {
        // const setCurrentEndLevel = () => {
        //     component.currentEndLevel = parent as EndLevel;
        //     (parent as EndLevel).shouldActivate = true;
        //     if (component instanceof LightPlayer) {
        //         (parent as EndLevel).shouldActivateLight = true;
        //     }
        //     if (component instanceof ShadowPlayer) {
        //         (parent as EndLevel).shouldActivateShadow = true;
        //     }
        // };
        // const clearCurrentEndLevel = () => {
        //     if (component.currentEndLevel) {
        //         if (component instanceof LightPlayer) {
        //             (
        //                 component.currentEndLevel as EndLevel
        //             ).shouldActivateLight = false;
        //         }
        //         if (component instanceof ShadowPlayer) {
        //             (
        //                 component.currentEndLevel as EndLevel
        //             ).shouldActivateShadow = false;
        //         }
        //         component.currentEndLevel.shouldActivate = false;
        //         component.currentEndLevel = undefined;
        //     }
        // };

        // when the component touch the floor
        if (isTouchingTheFloor(position, velocity, nearestObjects.down)) {
            velocity.y = 0;
            position.y = nearestObjects.down.point.y + 20;

            switch (true) {
                // case parent instanceof Elevator:
                //     component.currentElevator = parent as Elevator;
                //     (parent as Elevator).shouldActivate = true;
                //     component.state = MovableComponentState.ascend;
                //     break;
                case isTouchingDoorOpener(nearestObjects.down):
                    activateDoorOpener(levelState, nearestObjects.down);
                    break;
                // case parent?.name.includes('endLevel'):
                //     // setCurrentEndLevel();
                //     break;
            }
            state = MovableComponentState.onFloor;
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
            state = MovableComponentState.inAir;
            // clearCurrentDoorOpener();
            // clearCurrentEndLevel();
        }

        // if (!(parent instanceof Elevator) && component.currentElevator) {
        //     component.currentElevator.shouldActivate = false;
        //     component.currentElevator = undefined;
        // }

        if (
            !nearestObjects.down.object.parent?.name.includes(
                AREA_DOOR_OPENER_SUFFIX,
            )
        ) {
            clearDoorOpener(players, side, levelState, obstacles);
        }

        // if (!parent?.name.includes('endLevel')) {
        //     // clearCurrentEndLevel();
        // }
    }

    if (
        nearestObjects.right &&
        position.x + velocity.x + RANGE > nearestObjects.right.point.x
    ) {
        velocity.x = 0;
        position.x = nearestObjects.right.point.x - 20;
    }

    if (
        nearestObjects.left &&
        position.x + velocity.x < RANGE + nearestObjects.left.point.x
    ) {
        velocity.x = 0;
        position.x = nearestObjects.left.point.x + 20;
    }

    if (
        nearestObjects.up &&
        position.y + velocity.y + RANGE > nearestObjects.up.point.y
    ) {
        velocity.y = 0;
        position.y = nearestObjects.up.point.y - 20;
    }

    return state;
}
