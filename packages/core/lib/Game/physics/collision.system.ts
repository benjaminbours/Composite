// import { SocketController } from '../../../SocketController';
import { MovableComponent, MovableComponentState } from '../../types';
import { DoorOpener } from '../elements/DoorOpener';
import { EndLevel } from '../elements/EndLevel';
import { CollidingElem } from '../types';
// import { LightPlayer } from '../LightPlayer';
// import { ShadowPlayer } from '../ShadowPlayer';
// import { MovableComponent, MovableComponentState } from './movementHelpers';
import { getNearestObjects } from './raycaster';

const RANGE = 20;

export function collisionSystem(
    component: MovableComponent,
    obstacles: CollidingElem[],
): MovableComponentState {
    let state: MovableComponentState = MovableComponentState.onFloor;
    const { position, velocity } = component;

    const nearestObjects = getNearestObjects(position, obstacles);

    if (nearestObjects.down) {
        const { parent } = nearestObjects.down.object;

        // const setMovableComponentState = (state: MovableComponentState) => {
        //     if (component.state !== state) {
        //         component.state = state;
        //     }
        // };
        // const setCurrentDoorOpener = () => {
        //     const elem = parent as DoorOpener;
        //     component.currentDoorOpener = elem;
        //     elem.shouldActivate = true;
        //     // if (!elem.isActive) {
        //     //     console.log('HERE SEND');
        //     //     socketController.emit([
        //     //         SocketEventType.GAME_ACTIVATE_ELEMENT,
        //     //         { elementName: parent?.name! },
        //     //     ]);
        //     // }
        // };
        // const clearCurrentDoorOpener = () => {
        //     if (component.currentDoorOpener) {
        //         // socketController.emit([
        //         //     SocketEventType.GAME_DEACTIVATE_ELEMENT,
        //         //     { elementName: component.currentDoorOpener.name },
        //         // ]);
        //         component.currentDoorOpener.shouldActivate = false;
        //         component.currentDoorOpener = undefined;
        //     }
        // };

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
        if (position.y + velocity.y <= RANGE + nearestObjects.down.point.y) {
            velocity.y = 0;
            position.y = nearestObjects.down.point.y + 20;

            switch (true) {
                // case parent instanceof Elevator:
                //     component.currentElevator = parent as Elevator;
                //     (parent as Elevator).shouldActivate = true;
                //     component.state = MovableComponentState.ascend;
                //     break;
                case parent instanceof DoorOpener:
                    // setCurrentDoorOpener();
                    break;
                case parent instanceof EndLevel:
                    // setCurrentEndLevel();
                    break;
            }
            // setMovableComponentState(MovableComponentState.onFloor);
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
            // setMovableComponentState(MovableComponentState.inAir);
            state = MovableComponentState.inAir;
            // clearCurrentDoorOpener();
            // clearCurrentEndLevel();
        }

        // if (!(parent instanceof Elevator) && component.currentElevator) {
        //     component.currentElevator.shouldActivate = false;
        //     component.currentElevator = undefined;
        // }

        if (!(parent instanceof DoorOpener)) {
            // clearCurrentDoorOpener();
        }

        if (!(parent instanceof EndLevel)) {
            // clearCurrentEndLevel();
        }
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
