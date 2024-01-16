import { Inputs, MovableComponentState } from '../types';

const MAX_VELOCITY = 10;
const MIN_VELOCITY = 0.1;
const SPEED = 20;
const SPEED_INSIDE = 40;

const updateVelocity = (speed: number, target: number, velocity: number) => {
    return (velocity += (target - velocity) / speed);
};

export function computeVelocity(
    delta: number,
    input: Inputs,
    state: MovableComponentState,
    velocity: number,
    axis: 'x' | 'y',
) {
    const deltaInverse = 1 / delta / (60 * 60);
    const hasReachedMaxSpeed = Math.abs(velocity) > MAX_VELOCITY;
    const hasReachedMinSpeed = Math.abs(velocity) < MIN_VELOCITY;
    const speed = (() => {
        if (state === MovableComponentState.inside) {
            return SPEED_INSIDE * deltaInverse * 60;
        }
        return SPEED * deltaInverse * 60;
    })();

    if (axis === 'x') {
        if (input.left) {
            if (hasReachedMaxSpeed && velocity < 0) {
                velocity = -MAX_VELOCITY;
            } else {
                velocity = updateVelocity(speed, -MAX_VELOCITY, velocity);
            }
        }

        if (input.right) {
            if (hasReachedMaxSpeed && velocity > 0) {
                velocity = MAX_VELOCITY;
            } else {
                velocity = updateVelocity(speed, MAX_VELOCITY, velocity);
            }
        }

        if (!input.left && !input.right) {
            if (hasReachedMinSpeed) {
                velocity = 0;
            } else {
                velocity = updateVelocity(speed, 0, velocity);
            }
        }
    }

    if (axis === 'y') {
        if (input.bottom) {
            if (hasReachedMaxSpeed && velocity < 0) {
                velocity = -MAX_VELOCITY;
            } else {
                velocity = updateVelocity(speed, -MAX_VELOCITY, velocity);
            }
        }

        if (input.top) {
            if (hasReachedMaxSpeed && velocity > 0) {
                velocity = MAX_VELOCITY;
            } else {
                velocity = updateVelocity(speed, MAX_VELOCITY, velocity);
            }
        }

        if (!input.top && !input.bottom) {
            if (hasReachedMinSpeed) {
                velocity = 0;
            } else {
                velocity = updateVelocity(speed, 0, velocity);
            }
        }
    }

    return velocity;
}
