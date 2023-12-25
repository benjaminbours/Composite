import { Inputs } from '../types';

const MAX_VELOCITY = 10;
const SPEED = 20;

const updateVelocity = (delta: number, target: number, velocity: number) => {
    const speed = SPEED * delta * 60;
    return (velocity += (target - velocity) / speed);
};

export function computeVelocityX(
    delta: number,
    input: Inputs,
    velocityX: number,
) {
    const deltaInverse = 1 / delta / (60 * 60);
    const hasReachedMaxLeftSpeed = velocityX < -MAX_VELOCITY;
    const hasReachedMaxRightSpeed = velocityX > MAX_VELOCITY;
    if (input.left) {
        if (hasReachedMaxLeftSpeed) {
            velocityX = -MAX_VELOCITY;
        } else {
            velocityX = updateVelocity(deltaInverse, -MAX_VELOCITY, velocityX);
        }
    }

    if (input.right) {
        if (hasReachedMaxRightSpeed) {
            velocityX = MAX_VELOCITY;
        } else {
            velocityX = updateVelocity(deltaInverse, MAX_VELOCITY, velocityX);
        }
    }

    if (!input.left && !input.right) {
        velocityX = updateVelocity(deltaInverse, 0, velocityX);
    }

    return velocityX;
}

export function computeVelocityY(
    delta: number,
    input: Inputs,
    velocityY: number,
) {
    const deltaInverse = 1 / delta / (60 * 60);
    const hasReachedMaxLeftSpeed = velocityY < -MAX_VELOCITY;
    const hasReachedMaxRightSpeed = velocityY > MAX_VELOCITY;
    if (input.bottom) {
        if (hasReachedMaxLeftSpeed) {
            velocityY = -MAX_VELOCITY;
        } else {
            velocityY = updateVelocity(deltaInverse, -MAX_VELOCITY, velocityY);
        }
    }

    if (input.top) {
        if (hasReachedMaxRightSpeed) {
            velocityY = MAX_VELOCITY;
        } else {
            velocityY = updateVelocity(deltaInverse, MAX_VELOCITY, velocityY);
        }
    }

    if (!input.top && !input.bottom) {
        velocityY = updateVelocity(deltaInverse, 0, velocityY);
    }

    return velocityY;
}
