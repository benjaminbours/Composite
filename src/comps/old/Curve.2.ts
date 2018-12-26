import * as dat from "dat.gui";
// import { TweenMax } from "gsap";

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
}

function distanceFromMouse(point, circleX, circleY, circleRadius) {
    return (point.x - circleX) ** 2 + (point.y - circleY) ** 2;
}
export default class Curve {
    private isAnimating: boolean = false;
    private mouseCoordinate: IMouseCoordinate = {
        x: 0,
        y: 0,
    };

    private mouseRadius: number = 100;
    private mousePenetration: number = 1.5;

    private mousePerturbation: number = 0;
    private mousePosition: string = "top";
    private mouseIsIntersecting: boolean = false;

    private waves: ISineWave[] = [
        {
            step: 0,
            speed: 0,
            amplitude: 0,
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

        // let mousePosition;
        // if (this.mouseCoordinate.y > window.innerHeight / 2) {
        //     mousePosition = "bot";
        // } else {
        //     mousePosition = "top";
        // }
        // if (!this.isAnimating && this.mousePosition !== mousePosition) {
        //     console.log("NOW");
        //     this.isAnimating = true;
        // }
        // this.mousePosition = mousePosition;

        ctx.moveTo(x, 50);
        while (x < window.innerWidth) {
            y = this.waves.reduce((value: number, item) => {
                item.y = item.amplitude * Math.sin((x + item.step) / item.frequency);
                return value = value + item.y;
            }, window.innerHeight / 2);

            const distance = distanceFromMouse(this.mouseCoordinate, x, y, this.mouseRadius) / (this.mouseRadius * this.mousePenetration);
            if (x % 20 === 0) {
                console.log(this.mouseIsIntersecting);
            }
            if (isIntersect(this.mouseCoordinate, x, y, this.mouseRadius) && !this.mouseIsIntersecting) {
                this.mouseIsIntersecting = true;
                // let mousePerturbation;

                // switch (mousePosition) {
                //     case "bot":
                //         diffValue--;
                //         if (diffValue < 0) {
                //             diffValue = 41;
                //         }
                //         break;

                //     case "top":
                //         diffValue++;
                //         if (diffValue > 41) {
                //             diffValue = 0;
                //         }
                //         break;
                // }

                // if (!this.isAnimating) {
                if (this.mouseCoordinate.y > window.innerHeight / 2) {
                    this.mousePerturbation = distance - this.mouseRadius / this.mousePenetration;
                } else {
                    this.mousePerturbation = -distance + this.mouseRadius / this.mousePenetration;
                }
                // } else {
                // Tween
                // }
                // if (this.mousePerturbation > 0) {
                //     console.log("here");
                //     console.log(this.mousePerturbation);
                //     // this.mousePerturbation = this.mouse
                // }

                // ctx.lineTo(x, y + this.mousePerturbation);
            }
            // else {
            //     // ctx.lineTo(x, y);
            // }

            if (this.mousePerturbation > 0) {
                this.mousePerturbation--;
            }

            ctx.lineTo(x, y + this.mousePenetration);
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
    }
}
