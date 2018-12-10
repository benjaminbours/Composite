import * as dat from "dat.gui";

export default class Curve {
    private step: number = 0;
    private speed: number = 4;
    private amplitude: number = 60;
    private frequency: number = 100;

    private speed2: number = 4;
    private amplitude2: number = 60;
    private frequency2: number = 50;

    public constructor() {
        const gui = new dat.GUI();
        const sin1 = gui.addFolder("sin1");
        sin1.add(this, "speed", -20, 20);
        sin1.add(this, "amplitude", -200, 200);
        sin1.add(this, "frequency", 0, 250);
    }

    public render = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.lineWidth = 2;

        let x = 0;
        let y = 0;
        let y2 = 0;
        let y3 = 0;

        ctx.moveTo(x, 50);
        while (x < window.innerWidth) {
            y = this.amplitude * Math.sin((x + this.step) / this.frequency);
            y2 = this.amplitude2 * Math.sin((x + this.step) / this.frequency2);
            y3 = window.innerHeight / 2 + y + y2;
            ctx.lineTo(x, y3);
            x++;
        }
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.lineWidth = 2;

        // let x2 = 0;
        // ctx.moveTo(x2, 50);
        // while (x2 < window.innerWidth) {
        //     y2 = window.innerHeight / 2 + this.amplitude2 * Math.sin((x2 + this.step) / this.frequency2);
        //     ctx.lineTo(x2, y2);
        //     x2++;
        // }
        // ctx.stroke();
        // ctx.closePath();

        this.step += this.speed;
    }
}
