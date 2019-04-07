import { Clock } from "three";
import * as R from "ramda";
import Player from "../index";
import Inputs from "../Inputs";

const MAX_VELOCITY_X = 15;
const MAX_FALL_SPEED = 20;
const MAX_ASCEND_SPEED = 10;
const JUMP_POWER = 15;
const GRAVITY = 20;
const SPEED = 20; // less is faster
const CLOCK = new Clock();
export let delta = CLOCK.getDelta();
export const updateDelta = () => delta = CLOCK.getDelta();

export const useVelocity = (player: Player) => {
    player.position.x += (player.velocity.x * delta) * 60;
    player.position.y += (player.velocity.y * delta) * 60;
};

// Gravity helpers
const hasReachedMaxFallSpeed = R.propSatisfies(
    (y: number) => {
        // console.log(y <= -MAX_FALL_SPEED);
        return y <= -MAX_FALL_SPEED;
    },
    "y",
);
const setToMaxFallSpeed = (velocity) => velocity.y = -MAX_FALL_SPEED;
const increaseFallSpeed = (velocity) => velocity.y -= GRAVITY * delta;

const updateVelocityX = (target: number) => (velocity) => velocity.x += (target - velocity.x) / ((SPEED * delta) * 60);
// const updateVelocityY = (target: number) => (velocity) => velocity.y += (target - velocity.y) / ((SPEED * delta) * 60);

export const applyGravity = R.ifElse(
    hasReachedMaxFallSpeed,
    setToMaxFallSpeed,
    increaseFallSpeed,
);

const hasReachedMaxAscendSpeed = R.propSatisfies(
    (y: number) => {
        // console.log(y >= MAX_FALL_SPEED);
        return y >= MAX_ASCEND_SPEED;
    },
    "y",
);
const setToMaxAscendSpeed = (velocity) => velocity.y = MAX_ASCEND_SPEED;
const increaseAscendSpeed = (velocity) => {
    // console.log(delta * GRAVITY);
    // return velocity.y += GRAVITY * delta;
    // console.log(velocity.y += GRAVITY / 1000);
    return velocity.y += GRAVITY / 1000;
    // return velocity.y += GRAVITY * (delta < 0.03 ? 0.03 : delta);
};

// TODO: Inclure la distance par rapport au sol dans le calcule de la poussée vers le haut
export const applyAscension = R.ifElse(
    hasReachedMaxAscendSpeed,
    setToMaxAscendSpeed,
    increaseAscendSpeed,
);

// const maxAscensionDistance = 600;
// export function applyAscension(velocity, distanceFromFloor: number) {
//     // La velocity.y doit être égal à la distanceFromFloor divisé par...
//     // if (velocity.x >=) {

//     // }
// }

// Jump helpers
const isJumpPossible = (player: Player) => Inputs.jumpIsActive && player.state === "onFloor";
// const isJumpPossible = (player: Player) => Inputs.jumpIsActive && player.state === "onFloor";
const setToJumpPower = (player: Player) => player.velocity.y = JUMP_POWER;

export const jumpIfPossible = R.when(
    isJumpPossible,
    setToJumpPower,
);

// Left / Right helpers
const hasReachedMaxLeftSpeed = (velocity) => Inputs.leftIsActive && velocity.x > -MAX_VELOCITY_X;
const hasReachedMaxRightSpeed = (velocity) => Inputs.rightIsActive && velocity.x < MAX_VELOCITY_X;

export const moveLeft = R.ifElse(
    hasReachedMaxLeftSpeed,
    updateVelocityX(-MAX_VELOCITY_X),
    updateVelocityX(0),
);

export const moveRight = R.ifElse(
    hasReachedMaxRightSpeed,
    updateVelocityX(MAX_VELOCITY_X),
    updateVelocityX(0),
);
