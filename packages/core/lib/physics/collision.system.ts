import type { Object3D, Vec2 } from 'three';
import { INearestObjects, getNearestObjects } from './raycaster';
export const RANGE = 20;

export type CollidingObjects = INearestObjects;

// TODO: The whole function with the raycaster file could be merged / optimized
export function detectCollidingObjects(
    obstacles: Object3D[],
    player: { position: Vec2; velocity: Vec2 },
): INearestObjects {
    const { position, velocity } = player;

    const colliding: INearestObjects = {
        left: undefined,
        right: undefined,
        up: undefined,
        down: undefined,
    };

    const nearestObjects = getNearestObjects(position, obstacles);

    if (
        nearestObjects.down &&
        position.y + velocity.y <= RANGE + nearestObjects.down.point.y
    ) {
        colliding.down = nearestObjects.down;
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
        nearestObjects.up &&
        position.y + velocity.y + RANGE > nearestObjects.up.point.y
    ) {
        colliding.up = nearestObjects.up;
    }

    return colliding;
}
