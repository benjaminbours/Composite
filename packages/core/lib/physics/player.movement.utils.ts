import { Vector3 } from 'three';
import { Inputs, MovableComponentState, Side } from '../types';
import { PlayerGameState } from '../GameState';
import { ElementToBounce } from '../elements';
import { INearestObjects } from './raycaster';
import {
    COLLISION_DETECTION_RANGE,
    COLLISION_DETECTION_RANGE_INSIDE,
} from './collision.system';
import { getCenterPoint } from '../levels';

export const MAX_FALL_SPEED = 20;
export const JUMP_POWER = 15;
export const BOUNCE_POWER = 17;
export const GRAVITY = 20;

function handleDefaultCollision(
    direction: 'left' | 'right' | 'top' | 'bottom',
    player: PlayerGameState,
    point: Vector3,
) {
    const range =
        player.state === MovableComponentState.inside
            ? COLLISION_DETECTION_RANGE_INSIDE
            : COLLISION_DETECTION_RANGE;
    if (direction === 'left') {
        player.velocity.x = 0;
        player.position.x = point.x + range;
    }
    if (direction === 'right') {
        player.velocity.x = 0;
        player.position.x = point.x - range;
    }

    if (direction === 'top') {
        player.velocity.y = 0;
        player.position.y = point.y - range;
    }

    if (direction === 'bottom') {
        player.velocity.y = 0;
        player.position.y = point.y + range;
        if (player.state !== MovableComponentState.inside) {
            player.state = MovableComponentState.onFloor;
        }
    }
}

function handleEnterElementToBounce(
    bounceElement: ElementToBounce,
    player: PlayerGameState,
) {
    const center = getCenterPoint(bounceElement);
    player.state = MovableComponentState.inside;
    player.insideElementID = bounceElement.bounceID;
    player.position.x = center.x;
    player.position.y = center.y;
    player.velocity.x = 0;
    player.velocity.y = 0;
}

function handleBounceAgainstElement(
    normal: Vector3,
    object: ElementToBounce,
    player: PlayerGameState,
) {
    const global_normal = normal.clone();
    // a matrix which represents item's movement, rotation and scale on global world
    const mat = object.matrixWorld;

    // remove parallel movement from the matrix
    mat.setPosition(new Vector3(0, 0, 0));

    // change local normal into global normal
    global_normal.applyMatrix4(mat).normalize();

    const bouncePower = normal.z === 0 ? BOUNCE_POWER / 2 : BOUNCE_POWER;

    // multiply by the bounce power
    const bounceVector = global_normal.multiplyScalar(bouncePower);
    player.velocity.x = bounceVector.x;
    player.velocity.y = bounceVector.y;
}

export function handleCollision(
    collisionResult: INearestObjects,
    direction: 'left' | 'right' | 'top' | 'bottom',
    side: Side,
    player: PlayerGameState,
) {
    if (player.state === MovableComponentState.inside) {
        return;
    }

    const collision = collisionResult[direction];
    if (collision) {
        const collidingObject = collision.object as ElementToBounce;

        const shouldEnterElementToBounce =
            collidingObject.bounce && side === collidingObject.side;

        const shouldExitElementToBounce =
            collidingObject.bounce &&
            player.insideElementID === collidingObject.bounceID;

        const shouldBounceAgainst =
            collidingObject.bounce && side !== collidingObject.side;

        if (shouldExitElementToBounce) {
            return;
        }

        if (shouldEnterElementToBounce) {
            handleEnterElementToBounce(collidingObject, player);
        } else if (shouldBounceAgainst) {
            if (collision.normal === undefined) {
                return;
            }
            handleBounceAgainstElement(
                collision.normal,
                collidingObject,
                player,
            );
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
        player.state = MovableComponentState.inAir;

        if (input.left) {
            player.velocity.x = -JUMP_POWER;
            // player.velocity.y = JUMP_POWER / 2;
        } else if (input.right) {
            player.velocity.x = JUMP_POWER;
            // player.velocity.y = JUMP_POWER / 2;
        }

        if (input.top) {
            player.velocity.y = JUMP_POWER;
        } else if (input.bottom) {
            player.velocity.y = -JUMP_POWER;
        }
    }
}

export function applyGravity(player: PlayerGameState, delta: number) {
    if (player.state === MovableComponentState.inAir) {
        const hasReachedMaxFallSpeed = player.velocity.y <= -MAX_FALL_SPEED;
        if (hasReachedMaxFallSpeed) {
            player.velocity.y = -MAX_FALL_SPEED;
        } else {
            player.velocity.y -= GRAVITY * delta;
        }
    }
}

export function detectFalling(
    collisionResult: INearestObjects,
    player: PlayerGameState,
) {
    if (collisionResult.bottom) {
        return;
    }

    if (player.state !== MovableComponentState.inside) {
        player.state = MovableComponentState.inAir;
    }
}

export function clearInsideElementID(
    collisionResult: INearestObjects,
    player: PlayerGameState,
) {
    if (
        player.insideElementID !== undefined &&
        player.state !== MovableComponentState.inside &&
        !collisionResult.bottom &&
        !collisionResult.top &&
        !collisionResult.right &&
        !collisionResult.left
    ) {
        player.insideElementID = undefined;
    }
}
