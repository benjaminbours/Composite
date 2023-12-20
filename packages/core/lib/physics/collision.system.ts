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

    if (process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE) {
        return colliding;
    }

    // const playerBB = new Box3().setFromCenterAndSize(
    //     new Vector3(position.x, position.y),
    //     new Vector3(RANGE, RANGE),
    // );

    // for (let i = 0; i < obstacles.length; i++) {
    //     const obstacle = obstacles[i];
    //     const obstacleBB = new Box3().setFromObject(obstacle);

    //     if (playerBB.intersectsBox(obstacleBB)) {
    //         // console.log('HERE detect overlap style collision', obstacle);
    //         // console.log(obstacle.position);
    //         const intersectBB = playerBB.clone().intersect(obstacleBB);
    //         console.log('player box', playerBB);
    //         console.log('obstacle box', obstacleBB);
    //         console.log('intersect box', intersectBB);
    //     }
    // }

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
