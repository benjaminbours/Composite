import * as dat from "dat.gui";

interface ISineWave {
    step: number;
    speed: number;
    amplitude: number;
    frequency: number;
    y: number;
}
export default class Curve {
    // private step: number = 0;
    // private speed: number = 4;
    // private amplitude: number = 60;
    // private frequency: number = 100;

    // private step2: number = 0;
    // private speed2: number = 4;
    // private amplitude2: number = 60;
    // private frequency2: number = 50;

    // private step3: number = 0;
    // private speed3: number = 4;
    // private amplitude3: number = 60;
    // private frequency3: number = 50;

    private waves: ISineWave[] = [
        {
            step: 0,
            speed: 4,
            amplitude: 60,
            frequency: 100,
            y: 0,
        },
        {
            step: 0,
            speed: 4,
            amplitude: 60,
            frequency: 50,
            y: 0,
        },
    ];

    public constructor() {
        const gui = new dat.GUI();

        this.waves.forEach((item, index) => {
            const folder = gui.addFolder(`sin${index + 1}`);
            folder.add(item, "speed", -20, 20);
            folder.add(item, "amplitude", -200, 200);
            folder.add(item, "frequency", 0, 250);
        });
        // const sin1 = gui.addFolder("sin1");
        // sin1.add(this, "speed", -20, 20);
        // sin1.add(this, "amplitude", -200, 200);
        // sin1.add(this, "frequency", 0, 250);

        // const sin2 = gui.addFolder("sin2");
        // sin2.add(this, "speed2", -20, 20);
        // sin2.add(this, "amplitude2", -200, 200);
        // sin2.add(this, "frequency2", 0, 250);

        // const sin3 = gui.addFolder("sin3");
        // sin3.add(this, "speed3", -20, 20);
        // sin3.add(this, "amplitude3", -200, 200);
        // sin3.add(this, "frequency3", 0, 250);
    }

    public render = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.lineWidth = 2;

        let x = 0;
        let y = 0;
        // let y = 0;
        // let y2 = 0;
        // let y3 = 0;
        // let y4 = 0;

        ctx.moveTo(x, 50);
        while (x < window.innerWidth) {
            y = this.waves.reduce((value: number, item) => {
                item.y = item.amplitude * Math.sin((x + item.step) / item.frequency);
                return value = value + item.y;
            }, window.innerHeight / 2);
            // y = this.amplitude * Math.sin((x + this.step) / this.frequency);
            // y2 = this.amplitude2 * Math.sin((x + this.step2) / this.frequency2);
            // y3 = this.amplitude3 * Math.sin((x + this.step3) / this.frequency3);
            // y4 = window.innerHeight / 2 + y + y2;
            // y = window.innerHeight / 2 + y + y2 + y3;
            ctx.lineTo(x, y);
            // ctx.lineTo(x, y4);
            x++;
        }
        ctx.stroke();
        // ctx.fill();
        ctx.closePath();

        this.waves.forEach((item) => {
            item.step += item.speed;
        });
    }
}
