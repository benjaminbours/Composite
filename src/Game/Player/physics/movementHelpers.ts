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
        return y <= -MAX_FALL_SPEED;
    },
    "y",
);
const setToMaxFallSpeed = (velocity) => velocity.y = -MAX_FALL_SPEED;
const increaseFallSpeed = (velocity) => velocity.y -= GRAVITY * delta;

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
const increaseAscendSpeed = (velocity) => velocity.y += GRAVITY * delta;

// TODO: Inclure la distance par rapport au sol dans le calcule de la poussée vers le haut
export const applyAscension = R.ifElse(
    hasReachedMaxAscendSpeed,
    setToMaxAscendSpeed,
    increaseAscendSpeed,
);

// export function applyAscension(velocity, distanceFromFloor: number) {
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

const updateVelocity = (target: number) => (velocity) => velocity.x += (target - velocity.x) / ((SPEED * delta) * 60);

export const moveLeft = R.ifElse(
    hasReachedMaxLeftSpeed,
    updateVelocity(-MAX_VELOCITY_X),
    updateVelocity(0),
);

export const moveRight = R.ifElse(
    hasReachedMaxRightSpeed,
    updateVelocity(MAX_VELOCITY_X),
    updateVelocity(0),
);
