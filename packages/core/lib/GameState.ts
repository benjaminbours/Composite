import { Levels } from './types';

export class GameState {
    constructor(
        public level: Levels,
        public light_x: number,
        public light_y: number,
        public light_velocity_x: number,
        public light_velocity_y: number,
        public shadow_x: number,
        public shadow_y: number,
        public shadow_velocity_x: number,
        public shadow_velocity_y: number,
        public lastValidatedInput: number,
    ) {}
}
