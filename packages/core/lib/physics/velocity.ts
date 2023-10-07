import { Inputs } from '../types';

const MAX_VELOCITY_X = 10;
const SPEED = 20;

const updateVelocityX = (delta: number, target: number, velocityX: number) => {
    const speed = SPEED * delta * 60;
    return (velocityX += (target - velocityX) / speed);
};

export function computeVelocityX(
    delta: number,
    input: Inputs,
    velocityX: number,
) {
    const deltaInverse = 1 / delta / (60 * 60);
    const hasReachedMaxLeftSpeed = velocityX < -MAX_VELOCITY_X;
    const hasReachedMaxRightSpeed = velocityX > MAX_VELOCITY_X;
    if (input.left) {
        if (hasReachedMaxLeftSpeed) {
            velocityX = -MAX_VELOCITY_X;
        } else {
            velocityX = updateVelocityX(
                deltaInverse,
                -MAX_VELOCITY_X,
                velocityX,
            );
        }
    }

    if (input.right) {
        if (hasReachedMaxRightSpeed) {
            velocityX = MAX_VELOCITY_X;
        } else {
            velocityX = updateVelocityX(
                deltaInverse,
                MAX_VELOCITY_X,
                velocityX,
            );
        }
    }

    if (!input.left && !input.right) {
        velocityX = updateVelocityX(deltaInverse, 0, velocityX);
    }

    return velocityX;
}
