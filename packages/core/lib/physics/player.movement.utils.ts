import { Intersection, Matrix4, Vector3 } from 'three';
import { Inputs, MovableComponentState, Side } from '../types';
import { LevelState, PlayerGameState } from '../GameState';
import { ElementToBounce } from '../elements';
import { INearestObjects } from './raycaster';
import {
    COLLISION_DETECTION_RANGE,
    COLLISION_DETECTION_RANGE_INSIDE,
} from './collision.system';
import { degreesToRadians } from '../helpers/math';

export const MAX_FALL_SPEED = 20;
export const JUMP_POWER = 15;
export const BOUNCE_POWER = 30;
export const BOUNCE_POWER_MAX_Y = 17;
export const LEAVE_BOUNCE_POWER = 30;
export const LEAVE_BOUNCE_POWER_MAX_Y = 17;
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
    intersection: Intersection,
    player: PlayerGameState,
) {
    const bounceElement = intersection.object as ElementToBounce;
    const center = bounceElement.localToWorld(bounceElement.center.clone());
    if (intersection.normal) {
        bounceElement.entryNormal = intersection.normal;
    }
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

    if (Math.abs(bounceVector.y) > BOUNCE_POWER_MAX_Y) {
        const sign = Math.sign(bounceVector.y);
        player.velocity.y = BOUNCE_POWER_MAX_Y * sign;
    } else {
        player.velocity.y = bounceVector.y;
    }
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
            collidingObject.bounce &&
            side === collidingObject.side &&
            collidingObject.interactive;

        const shouldExitElementToBounce =
            collidingObject.bounce &&
            player.insideElementID === collidingObject.bounceID;

        const shouldBounceAgainst =
            collidingObject.bounce && side !== collidingObject.side;

        if (shouldExitElementToBounce) {
            return;
        }

        if (shouldEnterElementToBounce) {
            handleEnterElementToBounce(collision, player);
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

export function handleJump(
    input: Inputs,
    player: PlayerGameState,
    levelState: LevelState,
) {
    if (!input.jump) {
        return;
    }

    if (player.state === MovableComponentState.onFloor) {
        player.velocity.y = JUMP_POWER;
    } else if (
        player.state === MovableComponentState.inside &&
        player.insideElementID !== undefined
    ) {
        const rotationY = levelState.bounces[player.insideElementID].rotationY;
        const vectorToRotate = new Vector3(0, 1, 0);

        // Create the rotation matrix
        const rotationMatrix = new Matrix4();
        rotationMatrix.makeRotationAxis(
            new Vector3(1, 0, 0),
            degreesToRadians(rotationY),
        );

        // Apply the rotation to the vector
        const jumpOutDirectionVector = vectorToRotate
            .clone()
            .applyMatrix4(rotationMatrix)
            .multiplyScalar(LEAVE_BOUNCE_POWER);

        player.state = MovableComponentState.inAir;
        player.velocity.x = -jumpOutDirectionVector.z;
        if (Math.abs(jumpOutDirectionVector.y) > LEAVE_BOUNCE_POWER_MAX_Y) {
            const sign = Math.sign(jumpOutDirectionVector.y);
            player.velocity.y = LEAVE_BOUNCE_POWER_MAX_Y * sign;
        } else {
            player.velocity.y = jumpOutDirectionVector.y;
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
