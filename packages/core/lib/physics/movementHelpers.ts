import type { Intersection, Object3D, Vec2 } from 'three';
import { RANGE, detectCollidingObjects } from './collision.system';
import {
    GamePlayerInputPayload,
    Inputs,
    MovableComponentState,
    Side,
} from '../types';
import { GameState } from '../GameState';
import { computeVelocityX } from './velocity';
import { INearestObjects } from './raycaster';
import { AREA_DOOR_OPENER_SUFFIX, ElementName } from '../levels';
import { InteractiveArea } from '../elements';

const MAX_FALL_SPEED = 20;
const JUMP_POWER = 15;
const GRAVITY = 20;

// full of side effect
function applyPlayerUpdate(
    delta: number,
    input: Inputs,
    collisionResult: INearestObjects,
    player: { position: Vec2; velocity: Vec2 },
) {
    const { velocity, position } = player;
    let state: MovableComponentState = MovableComponentState.onFloor;

    if (collisionResult.left) {
        velocity.x = 0;
        position.x = collisionResult.left.point.x + RANGE;
    }

    if (collisionResult.right) {
        velocity.x = 0;
        position.x = collisionResult.right.point.x - RANGE;
    }

    if (collisionResult.up) {
        velocity.y = 0;
        position.y = collisionResult.up.point.y - RANGE;
    }

    if (collisionResult.down) {
        state = MovableComponentState.onFloor;
        velocity.y = 0;
        position.y = collisionResult.down.point.y + RANGE;
    } else {
        state = MovableComponentState.inAir;
    }

    // jump if possible
    if (input.jump && state === MovableComponentState.onFloor) {
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

    // use velocity to update position
    position.x += velocity.x * delta * 60;
    position.y += velocity.y * delta * 60;
}

export interface InteractiveComponent {
    shouldActivate: boolean;
    isActive: boolean;
}

type Context = 'client' | 'server';

export function applySingleInput(
    delta: number,
    side: Side,
    inputs: Inputs,
    collidingElems: Object3D[],
    gameState: GameState,
    context: Context,
) {
    const player = gameState.players[side];
    // side effect
    player.velocity.x = computeVelocityX(delta, inputs, player.velocity.x);

    const collisionResult = detectCollidingObjects(collidingElems, player);
    applyPlayerUpdate(delta, inputs, collisionResult, player);
    applyWorldUpdate(side, collidingElems, gameState, collisionResult, context);
}

export function applyInputList(
    delta: number,
    lastPlayersInput: (GamePlayerInputPayload | undefined)[],
    inputs: GamePlayerInputPayload[],
    collidingElements: Object3D[],
    gameState: GameState,
    context: Context,
    dev?: boolean,
) {
    if (dev) {
        console.log(gameState.game_time);
    }

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
            applySingleInput(
                delta,
                input.player,
                input.inputs,
                collidingElements,
                gameState,
                context,
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
                applySingleInput(
                    delta,
                    input.player,
                    input.inputs,
                    collidingElements,
                    gameState,
                    context,
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

const isTouchingDoorOpener = (objectDown: Intersection) => {
    const { parent } = objectDown.object;
    return parent?.name.includes(AREA_DOOR_OPENER_SUFFIX) || false;
};

function updateDoor(wallDoor: Object3D, ratio: number) {
    const doorLeft = wallDoor.children.find(
        (child) => child.name === 'doorLeft',
    )!;
    const doorRight = wallDoor.children.find(
        (child) => child.name === 'doorRight',
    )!;
    doorLeft.position.setX(-100 * ratio);
    doorRight.position.setX(100 * ratio);
    wallDoor.updateMatrixWorld();
}

// we could easily detect the activation area using position precalculated eventually.
// but if we update the level, we have to update it as well.
export function applyWorldUpdate(
    side: Side,
    obstacles: Object3D[],
    gameState: GameState,
    collisionResult: INearestObjects,
    context: Context,
) {
    let doorNameActivating: string | undefined = undefined;
    if (collisionResult.down && isTouchingDoorOpener(collisionResult.down)) {
        const elem = collisionResult.down.object.parent as InteractiveArea;
        doorNameActivating = `${elem.name.replace(
            `_${AREA_DOOR_OPENER_SUFFIX}`,
            '',
        )}`;
        if (
            gameState.level.doors[doorNameActivating].activators.indexOf(
                side,
            ) === -1
        ) {
            gameState.level.doors[doorNameActivating].activators.push(side);
        }
        if (gameState.level.doors[doorNameActivating].ratio < 1) {
            // TODO: If another player is on it as well, make sure its not opening faster
            // gameState.level.doors[doorNameActivating].ratio += 0.01;
            gameState.level.doors[doorNameActivating].ratio = 1;
        }
    }

    for (const key in gameState.level.doors) {
        let { ratio } = gameState.level.doors[key];
        const { activators } = gameState.level.doors[key];
        const doorIsActivated = ratio > 0;

        // We update the door only if its opening or closing
        if (!doorIsActivated) {
            continue;
        }

        // if this door opener is not the one we are currently activating
        // remove us from the list of activators
        if (key !== doorNameActivating) {
            const index = activators.indexOf(side);
            if (index !== -1) {
                activators.splice(index, 1);
            }
        }

        // no activator mean its closing
        if (!activators.length) {
            // side effect
            if (ratio > 0) {
                ratio = 0;
            }
        }

        if (context === 'server') {
            const wallDoor = obstacles.find(
                (e) => e.name === ElementName.WALL_DOOR(key),
            );
            if (wallDoor) {
                updateDoor(wallDoor, ratio);
                gameState.level.doors[key].ratio = ratio;
            }
        }
    }
}
