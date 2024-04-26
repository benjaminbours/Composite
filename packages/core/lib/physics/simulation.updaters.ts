import { type Intersection, type Object3D } from 'three';
import { detectCollidingObjects } from './collision.system';
import {
    GamePlayerInputPayload,
    InputsSync,
    MovableComponentState,
    Side,
} from '../types';
import {
    BounceState,
    GameState,
    LevelState,
    PlayerGameState,
} from '../GameState';
import { computeVelocity } from './velocity';
import { INearestObjects } from './raycaster';
import {
    AREA_DOOR_OPENER_SUFFIX,
    ElementName,
    LevelStartPosition,
} from '../levels';
import { ElementToBounce, InteractiveArea } from '../elements';
import {
    applyGravity,
    handleJump,
    handleCollision,
    detectFalling,
    clearInsideElementID,
} from './player.movement.utils';
import { degreesToRadians } from '../helpers/math';

export enum Context {
    client,
    server,
}

// full of side effect
function applyPlayerUpdate(
    delta: number,
    side: Side,
    input: InputsSync,
    collisionResult: INearestObjects,
    player: PlayerGameState,
    levelState: LevelState,
    freeMovementMode?: boolean,
) {
    // console.log('HERE collision result', collisionResult);
    clearInsideElementID(collisionResult, player);

    handleCollision(collisionResult, 'right', side, player);
    handleCollision(collisionResult, 'left', side, player);
    handleCollision(collisionResult, 'top', side, player);
    handleCollision(collisionResult, 'bottom', side, player);

    handleJump(input, player, levelState);
    if (player.state !== MovableComponentState.inside) {
        detectFalling(collisionResult, player);

        if (!freeMovementMode) {
            applyGravity(player, delta);
        }

        // use velocity to update position
        player.position.x += player.velocity.x * delta * 60;
        player.position.y += player.velocity.y * delta * 60;
    }
}

// World relate functions

const isTouchingDoorOpener = (objectDown: Intersection) => {
    return objectDown.object.name.includes(AREA_DOOR_OPENER_SUFFIX) || false;
};

const isTouchingEndLevel = (objectDown: Intersection) => {
    return objectDown.object.name.includes(ElementName.END_LEVEL) || false;
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
    player: PlayerGameState,
    context: Context,
) {
    // doors
    let doorNameActivating: string | undefined = undefined;
    if (
        collisionResult.bottom &&
        isTouchingDoorOpener(collisionResult.bottom)
    ) {
        const elem = collisionResult.bottom.object as InteractiveArea;
        doorNameActivating = `${elem.name.replace(
            `_${AREA_DOOR_OPENER_SUFFIX}`,
            '',
        )}`;
        if (
            gameState.level.doors[doorNameActivating] &&
            gameState.level.doors[doorNameActivating].indexOf(side) === -1
        ) {
            gameState.level.doors[doorNameActivating].push(side);
        }
    }

    for (const id in gameState.level.doors) {
        const activators = gameState.level.doors[id];

        // if this door opener is not the one we are currently activating
        // remove us from the list of activators
        if (id !== doorNameActivating) {
            const index = activators.indexOf(side);
            if (index !== -1) {
                activators.splice(index, 1);
            }
        }

        // TODO: Check if at some point, this kind of update should not be directly inside the component,
        // not here where we are suppose to manage game state
        // and have a condition there about updating for server or client
        if (context === Context.server) {
            const wallDoorGroup = obstacles.find(
                (e) => e.parent?.name === ElementName.WALL_DOOR(id),
            )?.parent;

            if (wallDoorGroup) {
                updateDoor(wallDoorGroup, activators.length > 0);
            }
        }
    }

    // bounces
    if (
        player.state === MovableComponentState.inside &&
        player.insideElementID !== undefined
    ) {
        const rotationY =
            gameState.level.bounces[player.insideElementID].rotationY -
            (player.velocity.x / 2) * -1;
        gameState.level.bounces[player.insideElementID].rotationY = rotationY;
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

function updateBounce(bounce: Object3D, rotationY: number) {
    bounce.rotation.y = degreesToRadians(rotationY);
    bounce.updateMatrixWorld();
}

export function updateServerBounces(
    bounces: Object3D[],
    bounceState: BounceState,
) {
    for (let i = 0; i < bounces.length; i++) {
        const bounce = bounces[i];
        // TODO: this can be improved, not a fan, think about it, id could be in the parent as well I don't know
        const bounceID = (bounce.children[0] as ElementToBounce).bounceID;
        if (bounceID in bounceState) {
            updateBounce(bounce, bounceState[bounceID].rotationY);
        }
    }
}

// responsible to take a single input and apply it to the game state
// and the game state only, it should not trigger any 3D changes
export function applySingleInputToSimulation(
    delta: number,
    side: Side,
    input: InputsSync,
    collidingElems: Object3D[],
    gameState: GameState,
    startPositions: LevelStartPosition,
    context: Context,
    freeMovementMode?: boolean,
) {
    const player = gameState.players[side];
    if (input.resetPosition) {
        const key = side === Side.LIGHT ? 'light' : 'shadow';
        player.position.x = startPositions[key].x;
        player.position.y = startPositions[key].y;
        player.velocity.x = 0;
        player.velocity.y = 0;
        player.state = MovableComponentState.inAir;
    } else {
        // side effect
        player.velocity.x = computeVelocity(
            delta,
            input,
            player.state,
            player.velocity.x,
            'x',
        );
        if (freeMovementMode || player.state === MovableComponentState.inside) {
            player.velocity.y = computeVelocity(
                delta,
                input,
                player.state,
                player.velocity.y,
                'y',
            );
        }
    }

    const collisionResult = detectCollidingObjects(
        collidingElems,
        player,
        freeMovementMode,
    );
    applyPlayerUpdate(
        delta,
        side,
        input,
        collisionResult,
        player,
        gameState.level,
        freeMovementMode,
    );
    applyWorldUpdate(
        side,
        collidingElems,
        gameState,
        collisionResult,
        player,
        context,
    );
}

// responsible to take many inputs and apply them to the game state
// and the game state only, it should not trigger any 3D changes
// could be name: apply inputs for tick to simulation
export function applyInputListToSimulation(
    delta: number,
    inputs: GamePlayerInputPayload[], // should always receive one input per player minimum
    collidingElements: Object3D[],
    gameState: GameState,
    startPositions: LevelStartPosition,
    context: Context,
    dev?: boolean,
    freeMovementMode?: boolean,
) {
    if (dev) {
        console.log(gameState.game_time);
    }

    // apply all inputs received
    for (let j = 0; j < inputs.length; j++) {
        const input = inputs[j];
        if (dev) {
            console.log('applying input for player', input.player);
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
        applySingleInputToSimulation(
            delta,
            input.player,
            input.inputs,
            collidingElements,
            gameState,
            startPositions,
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
    }
}
