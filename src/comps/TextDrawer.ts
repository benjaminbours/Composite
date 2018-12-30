import { TweenMax } from "gsap";
import { Side } from "../types";

export default class TextDrawer {
    public isMount: boolean = true;
    public onTransition: boolean = false;

    private readonly ctx: CanvasRenderingContext2D;
    private readonly color: string;

    private startX: number = 0;
    private startY: number = 30;

    private width: number = 0;
    private opacity: number = 1;

    private content: string;
    private side: Side;

    constructor(ctx: CanvasRenderingContext2D, side: Side, content: string, isMount: boolean) {
        this.ctx = ctx;
        this.side = side;
        this.isMount = isMount;
        this.color = side === "black" ? "#000" : "#FFF";
        this.content = content;
        this.width = this.ctx.measureText(this.content).width;
        this.resize();
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.ctx.save();
        this.ctx.canvas.style.letterSpacing = "20px";
        this.ctx.font = "400 30px sans-serif";
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fillText(this.content, this.startX, this.startY);
        if (TweenMax.ticker.frame === 4 || this.onTransition) {
            this.width = this.ctx.measureText(this.content).width;
            this.resize();
        }
        this.ctx.restore();
    }

    private resize = () => {
        this.startX = (this.ctx.canvas.width / 2) - this.width / 2;
        this.startY = (this.ctx.canvas.height / 100 * 50) - 100 / 2;
    }
}
