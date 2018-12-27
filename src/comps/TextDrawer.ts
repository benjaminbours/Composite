import { TweenMax } from "gsap";
import { Side } from "../types";

export default class TextDrawer {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly color: string;

    private startX: number = 0;
    private startY: number = 30;

    private width: number = 0;

    constructor(ctx: CanvasRenderingContext2D, color: Side) {
        this.ctx = ctx;
        this.color = color === "black" ? "#000" : "#FFF";
        this.width = this.ctx.measureText("THINK BOTH WAYS").width;
        this.resize();
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.ctx.canvas.style.letterSpacing = "20px";
        this.ctx.font = "400 30px sans-serif";
        this.ctx.fillStyle = this.color;
        this.ctx.fillText("THINK BOTH WAYS", this.startX, this.startY);
        if (TweenMax.ticker.frame === 4) {
            this.width = this.ctx.measureText("THINK BOTH WAYS").width;
            this.resize();
        }
    }

    private resize = () => {
        this.startX = (this.ctx.canvas.width / 2) - this.width / 2;
        this.startY = (this.ctx.canvas.height / 100 * 50) - 100 / 2;
    }
}
