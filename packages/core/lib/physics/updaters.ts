import { type Intersection, type Object3D } from 'three';
import { detectCollidingObjects } from './collision.system';
import {
    GamePlayerInputPayload,
    Inputs,
    MovableComponentState,
    Side,
} from '../types';
import {
    GameState,
    LevelState,
    PlayerGameState,
    PositionLevelState,
} from '../GameState';
import { computeVelocityX, computeVelocityY } from './velocity';
import { INearestObjects } from './raycaster';
import { AREA_DOOR_OPENER_SUFFIX, ElementName } from '../levels';
import { InteractiveArea } from '../elements';
import {
    applyGravity,
    handleJump,
    handleCollision,
    detectFalling,
    clearInsideElementID,
} from './player.movement.utils';

export enum Context {
    client,
    server,
}

// full of side effect
function applyPlayerUpdate(
    delta: number,
    side: Side,
    input: Inputs,
    collisionResult: INearestObjects,
    player: PlayerGameState,
    freeMovementMode?: boolean,
) {
    // console.log('HERE collision result', collisionResult);
    clearInsideElementID(collisionResult, player);

    // if (player.state !== MovableComponentState.collisionInsensitive) {
    handleCollision(collisionResult, 'right', side, player);
    handleCollision(collisionResult, 'left', side, player);
    handleCollision(collisionResult, 'top', side, player);
    handleCollision(collisionResult, 'bottom', side, player);
    // }

    detectFalling(collisionResult, player);
    handleJump(input, player);

    if (!freeMovementMode) {
        applyGravity(player, delta);
    }

    // use velocity to update position
    player.position.x += player.velocity.x * delta * 60;
    player.position.y += player.velocity.y * delta * 60;
}

// World relate functions

const isTouchingDoorOpener = (objectDown: Intersection) => {
    const { parent } = objectDown.object;
    return parent?.name.includes(AREA_DOOR_OPENER_SUFFIX) || false;
};

const isTouchingEndLevel = (objectDown: Intersection) => {
    const { parent } = objectDown.object;
    return parent?.name.includes(ElementName.END_LEVEL) || false;
};

function updateDoor(wallDoor: Object3D, open: boolean) {
    const ratio = open ? 1 : 0;
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
function applyWorldUpdate(
    side: Side,
    obstacles: Object3D[],
    gameState: GameState,
    collisionResult: INearestObjects,
    context: Context,
) {
    const isPositionLevel = (value: LevelState): value is PositionLevelState =>
        Boolean((value as PositionLevelState).doors);

    if (isPositionLevel(gameState.level)) {
        let doorNameActivating: string | undefined = undefined;
        if (
            collisionResult.bottom &&
            isTouchingDoorOpener(collisionResult.bottom)
        ) {
            const elem = collisionResult.bottom.object
                .parent as InteractiveArea;
            doorNameActivating = `${elem.name.replace(
                `_${AREA_DOOR_OPENER_SUFFIX}`,
                '',
            )}`;
            if (
                gameState.level.doors[doorNameActivating].indexOf(side) === -1
            ) {
                gameState.level.doors[doorNameActivating].push(side);
            }
        }

        for (const key in gameState.level.doors) {
            const activators = gameState.level.doors[key];

            // if this door opener is not the one we are currently activating
            // remove us from the list of activators
            if (key !== doorNameActivating) {
                const index = activators.indexOf(side);
                if (index !== -1) {
                    activators.splice(index, 1);
                }
            }

            if (context === Context.server) {
                const wallDoor = obstacles.find(
                    (e) => e.name === ElementName.WALL_DOOR(key),
                );
                if (wallDoor) {
                    updateDoor(wallDoor, activators.length > 0);
                }
            }
        }
    }

    const endLevelIndex = gameState.level.end_level.indexOf(side);
    if (collisionResult.bottom && isTouchingEndLevel(collisionResult.bottom)) {
        if (endLevelIndex === -1) {
            gameState.level.end_level.push(side);
        }
    } else if (endLevelIndex !== -1) {
        gameState.level.end_level.splice(endLevelIndex, 1);
    }
}

export function applySingleInput(
    delta: number,
    side: Side,
    inputs: Inputs,
    collidingElems: Object3D[],
    gameState: GameState,
    context: Context,
    freeMovementMode?: boolean,
) {
    const player = gameState.players[side];
    // side effect
    player.velocity.x = computeVelocityX(
        delta,
        inputs,
        player.state,
        player.velocity.x,
    );
    if (freeMovementMode || player.state === MovableComponentState.inside) {
        player.velocity.y = computeVelocityY(delta, inputs, player.velocity.y);
    }

    const collisionResult = detectCollidingObjects(
        collidingElems,
        player,
        freeMovementMode,
    );
    applyPlayerUpdate(
        delta,
        side,
        inputs,
        collisionResult,
        player,
        freeMovementMode,
    );
    applyWorldUpdate(side, collidingElems, gameState, collisionResult, context);
}

export function applyInputList(
    delta: number,
    lastPlayerInput: GamePlayerInputPayload | undefined,
    inputs: GamePlayerInputPayload[],
    collidingElements: Object3D[],
    gameState: GameState,
    context: Context,
    dev?: boolean,
    freeMovementMode?: boolean,
) {
    if (dev) {
        console.log(gameState.game_time);
    }
    let lastInput = lastPlayerInput;

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
                freeMovementMode,
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
            lastInput = input;
        }
    } else {
        // if there are no inputs for this tick, we have to deduce / interpolate player position
        // regarding the last action he did.
        if (dev) {
            console.log('last player input', lastInput);
        }

        if (lastInput) {
            if (dev) {
                console.log(
                    `no input for player ${lastInput.player} reapply last input`,
                );
                console.log(
                    'applying input',
                    lastInput.time,
                    lastInput.sequence,
                );
                console.log(
                    'applying input from position',
                    gameState.players[lastInput.player].position,
                );
                console.log(
                    'applying input from velocity',
                    gameState.players[lastInput.player].velocity,
                );
            }
            applySingleInput(
                delta,
                lastInput.player,
                lastInput.inputs,
                collidingElements,
                gameState,
                context,
                freeMovementMode,
            );
            if (dev) {
                console.log(
                    'applying input to position',
                    gameState.players[lastInput.player].position,
                );
                console.log(
                    'applying input to velocity',
                    gameState.players[lastInput.player].velocity,
                );
            }
        }
    }
    return lastInput;
}
