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

    private opacity: number = 1;

    private content: string;

    constructor(content: string, isMount: boolean, initialCoordinate: ICoordinate) {
        this.isMount = isMount;
        if (!isMount) {
            this.opacity = 0;
        }
        this.content = content;
        this.ix = initialCoordinate.x;
        this.iy = initialCoordinate.y;

        this.resize = this.resize.bind(this);
        this.render = this.render.bind(this);
    }

    public render(ctx: CanvasRenderingContext2D, color: Side) {
        ctx.save();
        ctx.canvas.style.letterSpacing = "20px";
        ctx.font = "400 30px sans-serif";
        ctx.fillStyle = color;
        ctx.globalAlpha = this.opacity;
        ctx.fillText(this.content, this.x, this.y);
        if (TweenMax.ticker.frame === 4 || this.onTransition) {
            this.width = ctx.measureText(this.content).width;
            this.resize(ctx);
        }
        ctx.restore();
    }

    public resize(ctx: CanvasRenderingContext2D) {
        // this.width = ctx.measureText(this.content).width;
        this.x = (ctx.canvas.width * this.ix) - this.width / 2;
        this.y = (ctx.canvas.height * this.iy) - 100 / 2;
    }
}
