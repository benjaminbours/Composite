import type { Object3D, Vec2 } from 'three';
import { collisionSystem } from './collision.system';
import {
    GamePlayerInputPayload,
    Inputs,
    MovableComponentState,
    Side,
} from '../types';
import { GameState } from '../GameState';

const MAX_VELOCITY_X = 10;
const MAX_FALL_SPEED = 20;
// const MAX_ASCEND_SPEED = 10;
const JUMP_POWER = 15;
const GRAVITY = 20;
const SPEED = 20; // less is faster

// // Ascension helpers
// const hasReachedMaxAscendSpeed = R.propSatisfies(
//     // predicate
//     (y: number) => y >= MAX_ASCEND_SPEED,
//     // name of the key on the object that will be used, most likely it will be a velocity object, vec2 or 3
//     'y',
// );
// const setToMaxAscendSpeed = (velocity: Vector2) =>
//     (velocity.y = MAX_ASCEND_SPEED);
// const increaseAscendSpeed = (velocity: Vector2) => {
//     // console.log(delta * GRAVITY);
//     // return velocity.y += GRAVITY * delta;
//     // console.log(velocity.y += GRAVITY / 1000);
//     return (velocity.y += GRAVITY / 1000);
//     // return velocity.y += GRAVITY * (delta < 0.03 ? 0.03 : delta);
// };

// // TODO: Inclure la distance par rapport au sol dans le calcule de la poussée vers le haut
// export const applyAscension = R.ifElse(
//     hasReachedMaxAscendSpeed,
//     setToMaxAscendSpeed,
//     increaseAscendSpeed,
// );

// const maxAscensionDistance = 600;
// export function applyAscension(velocity, distanceFromFloor: number) {
//     // La velocity.y doit être égal à la distanceFromFloor divisé par...
//     // if (velocity.x >=) {

//     // }
// }

export interface InteractiveComponent {
    shouldActivate: boolean;
    isActive: boolean;
}

const updateVelocityX = (delta: number, target: number, velocity: Vec2) => {
    const speed = SPEED * delta * 60;
    return (velocity.x += (target - velocity.x) / speed);
};

export function updateGameState(
    delta: number,
    side: Side,
    inputs: Inputs,
    collidingElems: Object3D[],
    gameState: GameState,
) {
    const deltaInverse = 1 / delta / (60 * 60);
    const { level, players } = gameState;
    const { velocity, position } = players[side];

    const hasReachedMaxLeftSpeed = velocity.x < -MAX_VELOCITY_X;
    const hasReachedMaxRightSpeed = velocity.x > MAX_VELOCITY_X;
    if (inputs.left) {
        if (hasReachedMaxLeftSpeed) {
            velocity.x = -MAX_VELOCITY_X;
        } else {
            updateVelocityX(deltaInverse, -MAX_VELOCITY_X, velocity);
        }
    }

    if (inputs.right) {
        if (hasReachedMaxRightSpeed) {
            velocity.x = MAX_VELOCITY_X;
        } else {
            updateVelocityX(deltaInverse, MAX_VELOCITY_X, velocity);
        }
    }

    if (!inputs.left && !inputs.right) {
        updateVelocityX(deltaInverse, 0, velocity);
    }

    // process collision
    const state = collisionSystem(players, side, level, collidingElems);

    // jump if possible
    if (inputs.jump && state === MovableComponentState.onFloor) {
        velocity.y = JUMP_POWER;
    }

    if (state === MovableComponentState.inAir) {
        // apply gravity
        const hasReachedMaxFallSpeed = velocity.y <= -MAX_FALL_SPEED;
        if (hasReachedMaxFallSpeed) {
            velocity.y = -MAX_FALL_SPEED;
        } else {
            velocity.y -= GRAVITY * delta;
        }
    }

    // What is 60 ?
    // use velocity to update position
    position.x += velocity.x * delta * 60;
    position.y += velocity.y * delta * 60;
}

export function applyInputs(
    lastPlayersInput: (GamePlayerInputPayload | undefined)[],
    inputs: GamePlayerInputPayload[],
    collidingElements: Object3D[],
    gameState: GameState,
    dev?: boolean,
) {
    if (dev) {
        console.log(gameState.game_time);
    }
    const tempDelta = 1000 / 60 / 1000;

    // if there are inputs for this time tick, we process them
    if (inputs.length) {
        for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j];
            if (dev) {
                console.log('applying input', input.time, input.sequence);
                console.log(
                    'applying input from position',
                    gameState.players[input.player].position,
                );
                console.log(
                    'applying input from velocity',
                    gameState.players[input.player].velocity,
                );
            }
            updateGameState(
                tempDelta,
                input.player,
                input.inputs,
                collidingElements,
                gameState,
            );
            if (dev) {
                console.log(
                    'applying input to position',
                    gameState.players[input.player].position,
                );
                console.log(
                    'applying input to velocity',
                    gameState.players[input.player].velocity,
                );
            }
            // side effect
            lastPlayersInput[input.player] = input;
            // side effect
            gameState.lastValidatedInput = input.sequence;
        }
    } else {
        // if there are no inputs for this tick, we have to deduce / interpolate player position
        // regarding the last action he did.

        for (let j = 0; j < lastPlayersInput.length; j++) {
            const input = lastPlayersInput[j];
            if (dev) {
                console.log('last player input', input);
            }

            if (input) {
                if (dev) {
                    console.log(
                        `no input for player ${input.player} reapply last input`,
                    );
                    console.log('applying input', input.time, input.sequence);
                    console.log(
                        'applying input from position',
                        gameState.players[input.player].position,
                    );
                    console.log(
                        'applying input from velocity',
                        gameState.players[input.player].velocity,
                    );
                }
                updateGameState(
                    tempDelta,
                    input.player,
                    input.inputs,
                    collidingElements,
                    gameState,
                );
                if (dev) {
                    console.log(
                        'applying input to position',
                        gameState.players[input.player].position,
                    );
                    console.log(
                        'applying input to velocity',
                        gameState.players[input.player].velocity,
                    );
                }
                // side effect
                gameState.lastValidatedInput = input.sequence;
            }
        }
    }
}
