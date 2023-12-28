import type { Object3D } from 'three';
import { INearestObjects, getNearestObjects } from './raycaster';
import { PlayerGameState } from '../GameState';
import { MovableComponentState } from '../types';

export const COLLISION_DETECTION_RANGE = 20;
export const COLLISION_DETECTION_RANGE_INSIDE = 10;

export type CollidingObjects = INearestObjects;

// TODO: The whole function with the raycaster file could be merged / optimized
export function detectCollidingObjects(
    obstacles: Object3D[],
    player: PlayerGameState,
    freeMovementMode?: boolean,
): INearestObjects {
    const { position, velocity, state } = player;
    const colliding: INearestObjects = {
        left: undefined,
        right: undefined,
        top: undefined,
        bottom: undefined,
    };

    if (freeMovementMode) {
        return colliding;
    }

    const nearestObjects = getNearestObjects(position, obstacles);

    const collisionDetectionRange =
        state === MovableComponentState.inside
            ? COLLISION_DETECTION_RANGE_INSIDE
            : COLLISION_DETECTION_RANGE;

    if (
        nearestObjects.bottom &&
        position.y + velocity.y - collisionDetectionRange <=
            nearestObjects.bottom.point.y
    ) {
        colliding.bottom = nearestObjects.bottom;
    }

    if (
        nearestObjects.right &&
        position.x + velocity.x + collisionDetectionRange >
            nearestObjects.right.point.x
    ) {
        colliding.right = nearestObjects.right;
    }

    if (
        nearestObjects.left &&
        position.x + velocity.x - collisionDetectionRange <
            nearestObjects.left.point.x
    ) {
        colliding.left = nearestObjects.left;
    }

    if (
        nearestObjects.top &&
        position.y + velocity.y + collisionDetectionRange >
            nearestObjects.top.point.y
    ) {
        colliding.top = nearestObjects.top;
    }

    return colliding;
}
