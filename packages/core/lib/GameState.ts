import type { Vec2 } from 'three';
import { MovableComponentState } from './types';

export interface LevelState {
    id: number;
    doors: DoorState;
    bounces: BounceState;
    end_level: number[];
}

export interface DoorState {
    // key = doorId
    [key: string]: {
        // key = openerId
        [key: string]: number[];
    };
}

export interface BounceState {
    [key: number]: {
        rotationY: number;
    };
}

export interface PlayerGameState {
    position: Vec2;
    velocity: Vec2;
    state: MovableComponentState;
    insideElementID: number | undefined;
}

interface RedisStaticGameState {
    level: string;
    light_x: string;
    light_y: string;
    light_velocity_x: string;
    light_velocity_y: string;
    light_state: string;
    light_inside_element_id: string | undefined;
    shadow_x: string;
    shadow_y: string;
    shadow_velocity_x: string;
    shadow_velocity_y: string;
    shadow_state: string;
    shadow_inside_element_id: string | undefined;
    lastValidatedInput: string;
    game_time: string;
    end_level: string;
}

interface RedisDynamicGameState {
    [key: string]: string | undefined;
}

export type RedisGameState = RedisStaticGameState & RedisDynamicGameState;

const REDIS_DYNAMIC_FIELDS = {
    DOOR: (doorId: string, openerId: string) =>
        `door_${doorId}_opener_${openerId}`,
    BOUNCE: (bounceId: string) => `bounce_${bounceId}`,
};

function parseActivators(str: string) {
    if (str === '') {
        return [];
    }
    return str.split(',').map((str) => Number(str));
}

export class GameState {
    constructor(
        public players: PlayerGameState[],
        public level: LevelState,
        /**
         * Just a sequence number of the last processed input
         */
        public lastValidatedInput: number,
        public game_time: number,
    ) {}

    // parse from the one level object allowed by redis
    static parseFromRedisGameState(state: RedisGameState) {
        const level = Number(state.level);
        const levelState: LevelState = {
            id: level,
            end_level: parseActivators(state.end_level),
            doors: {},
            bounces: {},
        };
        Object.entries(state).forEach(([key, value]) => {
            if (key.includes('door') && value !== undefined) {
                const parts = key.split('_');
                const doorId = parts[1];
                const openerId = parts[3];
                if (levelState.doors[doorId] === undefined) {
                    levelState.doors[doorId] = {};
                }
                levelState.doors[doorId][openerId] = parseActivators(value);
            }
            if (key.includes('bounce') && value) {
                levelState.bounces[Number(key.replace('bounce_', ''))] = {
                    rotationY: Number(value),
                };
            }
        });
        const gameState = new GameState(
            [
                {
                    position: {
                        x: Number(state.shadow_x),
                        y: Number(state.shadow_y),
                    },
                    velocity: {
                        x: Number(state.shadow_velocity_x),
                        y: Number(state.shadow_velocity_y),
                    },
                    state: Number(state.shadow_state) as MovableComponentState,
                    insideElementID:
                        state.shadow_inside_element_id !== undefined
                            ? Number(state.shadow_inside_element_id)
                            : undefined,
                },
                {
                    position: {
                        x: Number(state.light_x),
                        y: Number(state.light_y),
                    },
                    velocity: {
                        x: Number(state.light_velocity_x),
                        y: Number(state.light_velocity_y),
                    },
                    state: Number(state.light_state) as MovableComponentState,
                    insideElementID:
                        state.light_inside_element_id !== undefined
                            ? Number(state.light_inside_element_id)
                            : undefined,
                },
            ],
            levelState,
            Number(state.lastValidatedInput),
            Number(state.game_time),
        );
        return gameState;
    }

    static parseToRedisGameState(state: GameState) {
        const redisGameState: RedisGameState = {
            level: String(state.level.id),
            light_x: String(state.players[1].position.x),
            light_y: String(state.players[1].position.y),
            light_velocity_x: String(state.players[1].velocity.x),
            light_velocity_y: String(state.players[1].velocity.y),
            light_state: String(state.players[1].state),
            light_inside_element_id:
                state.players[1].insideElementID !== undefined
                    ? String(state.players[1].insideElementID)
                    : undefined,
            shadow_x: String(state.players[0].position.x),
            shadow_y: String(state.players[0].position.y),
            shadow_velocity_x: String(state.players[0].velocity.x),
            shadow_velocity_y: String(state.players[0].velocity.y),
            shadow_state: String(state.players[0].state),
            shadow_inside_element_id:
                state.players[0].insideElementID !== undefined
                    ? String(state.players[0].insideElementID)
                    : undefined,
            lastValidatedInput: String(state.lastValidatedInput),
            game_time: String(state.game_time),
            end_level: state.level.end_level.join(),
        };
        Object.entries(state.level.doors).forEach(([doorId, openers]) => {
            Object.entries(openers).forEach(([openerId, value]) => {
                redisGameState[REDIS_DYNAMIC_FIELDS.DOOR(doorId, openerId)] =
                    value.join();
            });
        });
        Object.entries(state.level.bounces).forEach(([key, value]) => {
            redisGameState[REDIS_DYNAMIC_FIELDS.BOUNCE(key)] = String(
                value.rotationY,
            );
        });
        return redisGameState;
    }
}
