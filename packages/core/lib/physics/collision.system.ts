import type { Intersection, Object3D, Vec2 } from 'three';
import { MovableComponent, MovableComponentState, Side } from '../types';
import { getNearestObjects } from './raycaster';
import { GameState, LevelState } from '../GameState';
import { AREA_DOOR_OPENER_SUFFIX, ElementName } from '../levels';
import { InteractiveArea } from '../elements';

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

const openTheDoor = (state: LevelState, objectDown: Intersection) => {
    const elem = objectDown.object.parent as InteractiveArea;
    const doorName = `${elem.name.replace(`_${AREA_DOOR_OPENER_SUFFIX}`, '')}`;
    // side effect
    if (state[`${doorName}_door` as keyof LevelState] < 1) {
        state[`${doorName}_door` as keyof LevelState] += 0.01;
    }
    // console.log('activate', `${doorName}_door`);
    // if (elem.wallDoor) {
    //     openTheDoor(
    //         elem.wallDoor,
    //         state[`${doorName}_door` as keyof LevelState],
    //     );
    // }
};

const closeTheDoor = (
    players: MovableComponent[],
    side: Side,
    levelState: LevelState,
    obstacles: Object3D[],
) => {
    // check in the state if there is any door activated
    for (const key in levelState) {
        const doorIsActivated =
            key.includes('door') && levelState[key as keyof LevelState] > 0;
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
        if (levelState[key as keyof LevelState] > 0) {
            levelState[key as keyof LevelState] -= 0.05;
        }
        // // console.log('deactivate', key);
        // const wallDoor = obstacles.find(
        //     (e) => e.name === ElementName.WALL_DOOR(doorName),
        // );

        // if (wallDoor) {
        //     closeTheDoor(wallDoor, levelState[key as keyof LevelState]);
        // }
    }
};

export interface Colliding {
    leftPointX?: number;
    rightPointX?: number;
    topPointY?: number;
    bottomPointY?: number;
}

export interface CollisionResult {
    state: MovableComponentState;
    colliding: Colliding;
}

export function collisionSystem(
    side: Side,
    obstacles: Object3D[],
    gameState: GameState,
): CollisionResult {
    let state: MovableComponentState = MovableComponentState.onFloor;
    const { position, velocity } = gameState.players[side];

    const colliding: Colliding = {
        leftPointX: undefined,
        rightPointX: undefined,
        topPointY: undefined,
        bottomPointY: undefined,
    };

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
            colliding.bottomPointY = nearestObjects.down.point.y + RANGE;
            state = MovableComponentState.onFloor;

            switch (true) {
                // case parent instanceof Elevator:
                //     component.currentElevator = parent as Elevator;
                //     (parent as Elevator).shouldActivate = true;
                //     component.state = MovableComponentState.ascend;
                //     break;
                case isTouchingDoorOpener(nearestObjects.down):
                    openTheDoor(gameState.level, nearestObjects.down);
                    break;
                // case parent?.name.includes('endLevel'):
                //     // setCurrentEndLevel();
                //     break;
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
            closeTheDoor(gameState.players, side, gameState.level, obstacles);
        }

        // if (!parent?.name.includes('endLevel')) {
        //     // clearCurrentEndLevel();
        // }
    }

    if (
        nearestObjects.right &&
        position.x + velocity.x + RANGE > nearestObjects.right.point.x
    ) {
        colliding.rightPointX = nearestObjects.right.point.x - RANGE;
    }

    if (
        nearestObjects.left &&
        position.x + velocity.x < RANGE + nearestObjects.left.point.x
    ) {
        colliding.leftPointX = nearestObjects.left.point.x + RANGE;
    }

    if (
        nearestObjects.up &&
        position.y + velocity.y + RANGE > nearestObjects.up.point.y
    ) {
        colliding.topPointY = nearestObjects.up.point.y - RANGE;
    }

    return { state, colliding };
}
