import { TweenMax } from "gsap";
// Maybe this class is not usefull anymore
export default class ImageDrawer {
    public startY: number = 30;
    public startX: number = 0;

    protected readonly ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.resize();
        window.addEventListener("resize", this.resize);
    }

    private resize = () => {
        this.startX = this.ctx.canvas.width / 2;
        this.startY = this.ctx.canvas.height * 0.75;
    }
}
