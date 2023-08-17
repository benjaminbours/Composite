import { ICoordinate, Side } from '../../types';

export default class TextDrawer {
    public isBothSide: boolean = true;
    public isMount: boolean = true;
    public onTransition: boolean = false;

    protected x: number = 0;
    protected y: number = 30;
    protected ix: number = 0;
    protected iy: number = 0;

    protected width: number = 0;
    protected fontSize: number = 30;
    protected letterSpacing: number = 20;
    protected fontWeight: number = 400;

    private opacity: number = 1;

    private content: string;

    constructor(
        content: string,
        isMount: boolean,
        initialCoordinate: ICoordinate,
    ) {
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
        ctx.textAlign = 'center';
        // ctx.canvas.style.letterSpacing = `${this.letterSpacing}px`;
        ctx.font = `${this.fontWeight} ${this.fontSize}px sans-serif`;
        ctx.fillStyle = color;
        ctx.globalAlpha = this.opacity;
        // this.width = ctx.measureText(this.content).width;
        // this.x = (ctx.canvas.width * this.ix) - this.width / 2;
        // this.x = (ctx.canvas.width / 2);
        this.x = ctx.canvas.width / 2 + 10;
        // this.x = (ctx.canvas.width * this.ix);
        this.y = ctx.canvas.height * this.iy;
        // ctx.fillText(this.content, this.x, this.y);
        ctx.renderText(this.content, this.x, this.y, this.letterSpacing);
        ctx.restore();
    }

    public resize(ctx: CanvasRenderingContext2D) {
        ctx.textAlign = 'center';
        this.fontSize = 30;
        this.letterSpacing = 20;
        this.fontWeight = 400;

        if (window.innerHeight < 700) {
            this.fontSize = 25;
        }

        if (window.innerWidth > 2000) {
            this.fontSize = 40;
        }

        if (window.innerWidth <= 768) {
            this.fontSize = 25;
        }

        if (window.innerWidth <= 620) {
            this.fontSize = 20;
            this.letterSpacing = 10;
        }

        if (window.innerWidth <= 380) {
            this.letterSpacing = 5;
        }

        this.width = ctx.measureText(this.content).width;
    }
}
