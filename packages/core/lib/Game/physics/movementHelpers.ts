import { Vector2 } from 'three';
import { CollidingElem } from '../types';
import { collisionSystem } from './collision.system';
import {
    GamePlayerInputPayload,
    GameState,
    Inputs,
    MovableComponentState,
    Side,
} from '../../types';

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

const updateVelocityX = (delta: number, target: number, velocity: Vector2) => {
    const speed = SPEED * delta * 60;
    return (velocity.x += (target - velocity.x) / speed);
};

export function updateGameState(
    delta: number,
    side: Side,
    inputs: Inputs,
    collidingElems: CollidingElem[],
    gameState: GameState,
) {
    const deltaInverse = 1 / delta / (60 * 60);
    const playerKey = side === Side.LIGHT ? 'light' : 'shadow';
    const velocity = new Vector2(
        gameState[`${playerKey}_velocity_x`],
        gameState[`${playerKey}_velocity_y`],
    );
    // // TODO: Test is this velocity stuff is very useful
    // const velocityOld = velocity.clone();
    const position = new Vector2(
        gameState[`${playerKey}_x`],
        gameState[`${playerKey}_y`],
    );

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
    const state = collisionSystem(
        // so far collision system is only for the main player
        { position, velocity },
        collidingElems,
    );

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

    // console.log('pos', position);
    // console.log('vel', velocity);

    // update game state
    gameState[`${playerKey}_velocity_x`] = velocity.x;
    gameState[`${playerKey}_velocity_y`] = velocity.y;
    gameState[`${playerKey}_x`] = position.x;
    gameState[`${playerKey}_y`] = position.y;
}

export function applyInputsUntilNow(
    lastPlayersInput: {
        light?: GamePlayerInputPayload;
        shadow?: GamePlayerInputPayload;
    },
    inputs: GamePlayerInputPayload[],
    gameState: GameState,
    dev?: boolean,
) {
    const targetTime = Date.now();
    const defaultTimeIncrement = 16.7;
    const defaultDelta = defaultTimeIncrement / 1000;
    if (dev) {
        console.log('inputs', inputs);
    }

    let counter = 0;
    for (
        let i = gameState.lastValidatedInput;
        // while there are inputs or while we reach the target time
        i <= targetTime || inputs.length !== 0;
        i += defaultTimeIncrement
    ) {
        counter++;
        const inputsForTick = inputs.filter(({ time }) => time <= i);

        // if there are inputs for this time tick, we process them
        if (inputsForTick.length) {
            inputsForTick.forEach((input) => {
                const { player, delta, time, inputs } = input;
                updateGameState(delta, player, inputs, [], gameState);
                if (dev) {
                    console.log('applying input', time);
                }
                if (player === Side.LIGHT) {
                    lastPlayersInput.light = input;
                } else {
                    lastPlayersInput.shadow = input;
                }
            });
            // then we remove them from the list
            inputs = inputs.filter((input) => !inputsForTick.includes(input));
        } else {
            // if there are no inputs for this tick, we have to deduce / interpolate player position
            // regarding the last action he did.

            // if the last input is a release right or left key input, we apply deceleration
            (['light', 'shadow'] as (keyof typeof lastPlayersInput)[]).forEach(
                (player) => {
                    if (
                        lastPlayersInput[player] &&
                        !lastPlayersInput[player]?.inputs.left &&
                        !lastPlayersInput[player]?.inputs.right
                    ) {
                        if (dev) {
                            console.log(`${player} apply decelerate`);
                        }
                        updateGameState(
                            // without input received, we have to use the default delta
                            defaultDelta,
                            player === 'light' ? Side.LIGHT : Side.SHADOW,
                            {
                                left: false,
                                right: false,
                                jump: false,
                            },
                            [],
                            gameState,
                        );
                    } else {
                        // if the last input is not a release left or right key, its very likely the player
                        // has lag or low frame rate and we expect to receive more information about him later
                        if (dev) {
                            console.log(
                                `Nothing to apply for the ${player}, waiting more inputs`,
                            );
                        }
                    }
                },
            );
        }
        if (dev) {
            console.log(counter);
            console.log(i);
            console.log(gameState.light_x, gameState.light_velocity_x);
        }
        gameState.lastValidatedInput = i;
    }
}
