import type { Vec2 } from 'three';

export enum Levels {
    CRACK_THE_DOOR,
    LEARN_TO_FLY,
    THE_HIGH_SPHERES,
}

interface Level {
    doors: {
        [key: string]: number[];
    };
    end_level: number[];
}

export interface PositionLevelState extends Level {
    id: Levels.CRACK_THE_DOOR;
}

interface OtherLevelState extends Level {
    id: Levels.LEARN_TO_FLY;
}

export type LevelState = PositionLevelState | OtherLevelState;

// orders of properties are very important here
export class RedisGameState {
    constructor(
        public level: string,
        public light_x: string,
        public light_y: string,
        public light_velocity_x: string,
        public light_velocity_y: string,
        public shadow_x: string,
        public shadow_y: string,
        public shadow_velocity_x: string,
        public shadow_velocity_y: string,
        public lastValidatedInput: string,
        public game_time: string,
        public end_level: string,
        public level_0_door_ground: string,
        public level_0_door_roof: string,
    ) {}

    static parseGameState(state: GameState) {
        return new RedisGameState(
            String(state.level.id),
            String(state.players[1].position.x),
            String(state.players[1].position.y),
            String(state.players[1].velocity.x),
            String(state.players[1].velocity.y),
            String(state.players[0].position.x),
            String(state.players[0].position.y),
            String(state.players[0].velocity.x),
            String(state.players[0].velocity.y),
            String(state.lastValidatedInput),
            String(state.game_time),
            state.level.end_level.join(),
            (state.level as PositionLevelState).doors.ground.join(),
            (state.level as PositionLevelState).doors.roof.join(),
        );
    }
}

function parseActivators(str: string) {
    if (str === '') {
        return [];
    }
    return str.split(',').map((str) => Number(str));
}

export class GameState {
    constructor(
        public players: {
            position: Vec2;
            velocity: Vec2;
        }[],
        public level: LevelState,
        public lastValidatedInput: number,
        public game_time: number,
    ) {}

    // parse from the one level object allowed by redis
    static parseRedisGameState(state: RedisGameState) {
        const level: Levels = Number(state.level);
        let levelState = (() => {
            switch (level) {
                case Levels.CRACK_THE_DOOR:
                    return {
                        id: level,
                        doors: {
                            ground: parseActivators(state.level_0_door_ground),
                            roof: parseActivators(state.level_0_door_roof),
                        },
                        end_level: parseActivators(state.end_level),
                    };
                case Levels.LEARN_TO_FLY:
                    return {
                        id: level,
                        end_level: parseActivators(state.end_level),
                        doors: {},
                    };
            }
        })() as LevelState;
        return new GameState(
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
                },
            ],
            levelState,
            Number(state.lastValidatedInput),
            Number(state.game_time),
        );
    }
}
