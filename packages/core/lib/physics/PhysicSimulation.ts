export class PhysicSimulation {
    public loops = 0;
    private tick_rate = 120;
    private skip_ticks = 1000 / this.tick_rate;
    public delta = this.skip_ticks / 1000;
    // private max_frame_skip = 10;
    private next_game_tick = performance.now();
    public total_loops = 0;

    public run = (callback: (delta: number) => void) => {
        this.loops = 0;

        while (
            performance.now() > this.next_game_tick
            //  &&
            // this.loops < this.max_frame_skip
        ) {
            callback(this.delta);
            this.next_game_tick += this.skip_ticks;
            this.loops++;
            this.total_loops++;
        }
    };
}
