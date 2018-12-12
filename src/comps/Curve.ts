import * as dat from "dat.gui";

interface ISineWave {
    step: number;
    speed: number;
    amplitude: number;
    frequency: number;
    y: number;
}

interface IMouseCoordinate {
    x: number;
    y: number;
}

function isIntersect(point, circleX, circleY, circleRadius) {
    return Math.sqrt((point.x - circleX) ** 2 + (point.y - circleY) ** 2) < circleRadius;
    // return Math.sqrt((point.x - circleY) ** 2 + (point.y - circleY) ** 2) < circleRadius;
}
export default class Curve {
    private mouseCoordinate: IMouseCoordinate = {
        x: 0,
        y: 0,
    };

    private waves: ISineWave[] = [
        {
            step: 0,
            speed: 4,
            amplitude: 60,
            frequency: 100,
            y: 0,
        },
        // {
        //     step: 0,
        //     speed: 4,
        //     amplitude: 60,
        //     frequency: 50,
        //     y: 0,
        // },
    ];

    public constructor() {
        const gui = new dat.GUI();

        this.waves.forEach((item, index) => {
            const folder = gui.addFolder(`sin${index + 1}`);
            folder.add(item, "speed", -20, 20);
            folder.add(item, "amplitude", -200, 200);
            folder.add(item, "frequency", 0, 250);
        });

        document.addEventListener("mousemove", this.handleMouseMove);
    }

    public render = (ctx: CanvasRenderingContext2D) => {
        ctx.beginPath();
        ctx.lineWidth = 2;

        let x = 0;
        let y = 0;

        ctx.moveTo(x, 50);
        while (x < window.innerWidth) {
            y = this.waves.reduce((value: number, item) => {
                item.y = item.amplitude * Math.sin((x + item.step) / item.frequency);
                return value = value + item.y;
            }, window.innerHeight / 2);

            // console.log(isIntersect(this.mouseCoordinate, x, y, 10));
            // const distanceFromMouse = x
            if (isIntersect(this.mouseCoordinate, x, y, 100)) {
                // console.log("here", x, y);
                ctx.lineTo(x, y + this.mouseCoordinate.y / 10);
            } else {
                ctx.lineTo(x, y);
            //     ctx.lineTo(x, y + this.mouseCoordinate.y / 10);
            }
            x++;
        }
        ctx.stroke();
        ctx.closePath();

        this.waves.forEach((item) => {
            item.step += item.speed;
        });
    }

    private handleMouseMove = (e: MouseEvent) => {
        this.mouseCoordinate = {
            x: e.x,
            y: e.y,
        };
        // console.log(e.x);
        // console.log(e.y);
    }
}
