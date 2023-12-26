import { Mesh, Vector3 } from 'three';
import { Inputs, MovableComponentState, Side } from '../types';
import { RANGE } from './collision.system';
import { PlayerGameState } from '../GameState';
import { ElementToBounce } from '../elements';
import { INearestObjects } from './raycaster';

export const MAX_FALL_SPEED = 20;
export const JUMP_POWER = 15;
export const BOUNCE_POWER = 15;
export const GRAVITY = 20;

function handleDefaultCollision(
    direction: 'left' | 'right' | 'top' | 'bottom',
    player: PlayerGameState,
    point: Vector3,
) {
    if (direction === 'left') {
        player.velocity.x = 0;
        player.position.x = point.x + RANGE;
    }
    if (direction === 'right') {
        player.velocity.x = 0;
        player.position.x = point.x - RANGE;
    }

    if (direction === 'top') {
        player.velocity.y = 0;
        player.position.y = point.y - RANGE;
    }

    if (direction === 'bottom') {
        player.velocity.y = 0;
        player.position.y = point.y + RANGE;
        if (player.state !== MovableComponentState.inside) {
            player.state = MovableComponentState.onFloor;
        }
    }
}

function getCenterPoint(mesh: Mesh) {
    var geometry = mesh.geometry;
    geometry.computeBoundingBox();
    var center = new Vector3();
    geometry.boundingBox?.getCenter(center);
    mesh.localToWorld(center);
    return center;
}

function handleEnterElementToBounce(
    bounceElement: ElementToBounce,
    player: PlayerGameState,
) {
    const center = getCenterPoint(bounceElement);
    player.state = MovableComponentState.inside;
    player.position.x = center.x;
    player.position.y = center.y;
    player.velocity.x = 0;
    player.velocity.y = 0;
}

export function handleCollision(
    collisionResult: INearestObjects,
    direction: 'left' | 'right' | 'top' | 'bottom',
    side: Side,
    player: PlayerGameState,
) {
    const collision = collisionResult[direction];
    if (collision) {
        const collidingObject = collision.object as ElementToBounce;

        const shouldEnterElementToBounce =
            collidingObject.bounce &&
            side === collidingObject.side &&
            player.state !== MovableComponentState.inside;

        if (shouldEnterElementToBounce) {
            handleEnterElementToBounce(collidingObject, player);
            // TODO: is bouncing on opposite element
            // velocity.y = BOUNCE_POWER;
            // velocity.x = 10;
        } else {
            // normal collision
            handleDefaultCollision(direction, player, collision.point);
        }
    }
}

export function handleJump(input: Inputs, player: PlayerGameState) {
    if (!input.jump) {
        return;
    }

    if (player.state === MovableComponentState.onFloor) {
        player.velocity.y = JUMP_POWER;
    } else if (player.state === MovableComponentState.inside) {
        player.state = MovableComponentState.collisionInsensitive;

        if (input.left) {
            player.velocity.x = -BOUNCE_POWER;
            // player.velocity.y = BOUNCE_POWER / 2;
        } else if (input.right) {
            player.velocity.x = BOUNCE_POWER;
            // player.velocity.y = BOUNCE_POWER / 2;
        }

        if (input.top) {
            player.velocity.y = BOUNCE_POWER;
        } else if (input.bottom) {
            player.velocity.y = -BOUNCE_POWER;
        }
    }
}

export function applyGravity(player: PlayerGameState, delta: number) {
    if (
        player.state === MovableComponentState.inAir ||
        player.state === MovableComponentState.collisionInsensitive
    ) {
        const hasReachedMaxFallSpeed = player.velocity.y <= -MAX_FALL_SPEED;
        if (hasReachedMaxFallSpeed) {
            player.velocity.y = -MAX_FALL_SPEED;
        } else {
            player.velocity.y -= GRAVITY * delta;
        }
    }
}

export function detectSensitivityToCollision(
    collisionResult: INearestObjects,
    player: PlayerGameState,
) {
    // when the player is exiting an element he was previously inside
    // he becomes insensitive to collision for a short period of time
    // to avoid being stuck inside the element
    // and then when he is far enough from the element (when no more collision)
    // he becomes inAir, and then sensitive to collision again
    if (
        player.state === MovableComponentState.collisionInsensitive &&
        !collisionResult.bottom &&
        !collisionResult.top &&
        !collisionResult.right &&
        !collisionResult.left
    ) {
        player.state = MovableComponentState.inAir;
    }
}

export function detectFalling(
    collisionResult: INearestObjects,
    player: PlayerGameState,
) {
    if (collisionResult.bottom) {
        return;
    }

    if (
        player.state !== MovableComponentState.inside &&
        player.state !== MovableComponentState.collisionInsensitive
    ) {
        player.state = MovableComponentState.inAir;
    }
}
