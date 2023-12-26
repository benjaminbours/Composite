import type { Object3D, Vec2 } from 'three';
import { INearestObjects, getNearestObjects } from './raycaster';
export const RANGE = 20;

export type CollidingObjects = INearestObjects;

// TODO: The whole function with the raycaster file could be merged / optimized
export function detectCollidingObjects(
    obstacles: Object3D[],
    position: Vec2,
    velocity: Vec2,
    freeMovementMode?: boolean,
): INearestObjects {
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

    if (
        nearestObjects.bottom &&
        position.y + velocity.y <= RANGE + nearestObjects.bottom.point.y
    ) {
        colliding.bottom = nearestObjects.bottom;
    }

    if (
        nearestObjects.right &&
        position.x + velocity.x + RANGE > nearestObjects.right.point.x
    ) {
        colliding.right = nearestObjects.right;
    }

    if (
        nearestObjects.left &&
        position.x + velocity.x < RANGE + nearestObjects.left.point.x
    ) {
        colliding.left = nearestObjects.left;
    }

    if (
        nearestObjects.top &&
        position.y + velocity.y + RANGE > nearestObjects.top.point.y
    ) {
        colliding.top = nearestObjects.top;
    }

    return colliding;
}
