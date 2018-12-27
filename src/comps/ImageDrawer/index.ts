// Maybe this class is not usefull anymore

export default class ImageDrawer {
    protected readonly ctx: CanvasRenderingContext2D;

    protected startX: number = 0;
    protected startY: number = 30;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.resize();
        window.addEventListener("resize", this.resize);
    }

    private resize = () => {
        this.startX = (this.ctx.canvas.width / 2);
        this.startY = (this.ctx.canvas.height / 2) + this.ctx.canvas.height / 100 * 25;
    }
}
