import { TweenMax } from "gsap";
import { ICoordinate, Side } from "../types";

export default class TextDrawer {
    public isMount: boolean = true;
    public onTransition: boolean = false;

    protected x: number = 0;
    protected y: number = 30;
    protected ix: number = 0;
    protected iy: number = 0;

    protected width: number = 0;
    protected fontSize: number = 30;

    private opacity: number = 1;

    private content: string;
    // private lineHeight: number = 40;
    private letterSpacing: number = 20;

    constructor(content: string, isMount: boolean, initialCoordinate: ICoordinate) {
        this.isMount = isMount;
        if (!isMount) {
            this.opacity = 0;
        }
        this.content = content;
        this.ix = initialCoordinate.x;
        this.iy = initialCoordinate.y;

        // this.resize = this.resize.bind(this);
        this.render = this.render.bind(this);
    }

    public render(ctx: CanvasRenderingContext2D, color: Side) {
        this.fontSize = 30;
        this.letterSpacing = 20;
        let positionY = 100;
        if (window.innerHeight < 700) {
            this.fontSize = 25;
        }

        if (window.innerWidth > 1700) {
            this.fontSize = 40;
        }

        if (window.innerWidth <= 768) {
            this.fontSize = 25;
        }

        if (window.innerWidth <= 580) {
            this.fontSize = 20;
            this.letterSpacing = 10;
        }

        if (window.innerWidth <= 400 && window.innerHeight <= 700) {
            positionY = 200;
        }

        if (window.innerWidth <= 400) {
            this.fontSize = 18;
            this.letterSpacing = 5;
        }
        ctx.save();
        ctx.canvas.style.letterSpacing = `${this.letterSpacing}px`;
        ctx.font = `400 ${this.fontSize}px sans-serif`;
        ctx.fillStyle = color;
        ctx.globalAlpha = this.opacity;
        this.width = ctx.measureText(this.content).width;
        this.x = (ctx.canvas.width * this.ix) - this.width / 2;
        this.y = (ctx.canvas.height * this.iy) - positionY / 2;
        ctx.fillText(this.content, this.x, this.y);
        ctx.restore();

        if (window.innerHeight < 700) {
            this.width = ctx.measureText(this.content).width;
        }
    }

    // if (window.innerWidth <= 580) {
    //     const words = this.content.split(" ");
    //     for (let i = 0; i < words.length; i++) {
    //         if (i === 0) {
    //             continue;
    //         }

    //         if (i === 1) {
    //             words[i] = `${words[i - 1]} ${words[i]}`;
    //         }
    //         ctx.save();
    //         this.width = ctx.measureText(words[i]).width;
    //         // this.x = this.width / 3;
    //         // this.x = (ctx.canvas.width * this.ix) - this.width / 2.1;
    //         this.x = (ctx.canvas.width * this.ix) - this.width / 2.333;
    //         // this.x = (ctx.canvas.width * this.ix) - this.width / 2;
    //         this.y = (ctx.canvas.height * this.iy) - 120;
    //         if (i === 1) {
    //             this.x += -10;
    //         }
    //         ctx.fillText(words[i], this.x, this.y + this.lineHeight * i);
    //         ctx.restore();
    //     }
    // } else {
}
