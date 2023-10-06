import type { Vec2 } from 'three';

export enum Levels {
    CRACK_THE_DOOR,
    LEARN_TO_FLY,
    THE_HIGH_SPHERES,
}

export interface PositionLevelState {
    id: Levels.CRACK_THE_DOOR;
    ground_door: number;
    roof_door: number;
    end_level: number;
}

interface OtherLevelState {
    id: Levels.LEARN_TO_FLY;
    end_level: number;
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
        public end_level?: string,
        public level_0_ground_door?: string,
        public level_0_roof_door?: string,
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
            String(state.level.end_level),
            String((state.level as any).ground_door),
            String((state.level as any).roof_door),
        );
    }
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
                        end_level: Number(state.end_level),
                        ground_door: Number(state.level_0_ground_door),
                        roof_door: Number(state.level_0_roof_door),
                    };

                case Levels.LEARN_TO_FLY:
                    return {
                        id: level,
                        end_level: Number(state.end_level),
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
