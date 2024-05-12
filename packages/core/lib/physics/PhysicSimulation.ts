import { Clock } from 'three';

export class PhysicSimulation {
    public loops = 0;
    private tick_rate = 120;
    private skip_ticks = 1000 / this.tick_rate;
    public delta = this.skip_ticks / 1000;
    // private max_frame_skip = 10;
    public total_loops = 0;
    public previousElapsedTime = 0;
    public clock: Clock;
    private next_game_tick = 0;

    constructor(autoStart?: boolean) {
        this.clock = new Clock(autoStart);
    }

    public run = (callback: (delta: number) => void) => {
        this.loops = 0;

        while (
            this.clock.getElapsedTime() * 1000 >
            this.next_game_tick
            //  &&
            // this.loops < this.max_frame_skip
        ) {
            callback(this.delta);
            this.next_game_tick += this.skip_ticks;
            this.loops++;
            this.total_loops++;
        }
    };

    public start = () => {
        this.previousElapsedTime = this.clock.elapsedTime;
        this.clock.start();
        this.clock.elapsedTime = this.previousElapsedTime;
    };

    public stop = () => {
        this.clock.stop();
    };
}
