import type { Side } from '../../types';

const mainTitleWhite = new Image();
mainTitleWhite.src = '/composite_white.svg';
const mainTitleBlack = new Image();
mainTitleBlack.src = '/composite_black.svg';

export default class MainTitle {
    public isBothSide: boolean = true;
    public isMount: boolean = true;
    public onTransition: boolean = false;
    public startX: number = 0;
    public startY: number = 0;

    private iy: number = 0.3;

    private width: number = 1370;
    private height: number = 99;
    private ratio: number = this.width / this.height;

    private opacity: number = 1;

    constructor(isMount: boolean) {
        this.isMount = isMount;
    }

    public render = (ctx: CanvasRenderingContext2D, color: Side): boolean => {
        if (ctx.canvas.width <= 768 && color === 'black') {
            return false;
        }
        const img = color === 'black' ? mainTitleBlack : mainTitleWhite;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(img, this.startX, this.startY, this.width, this.height);
        ctx.restore();
        return true;
    };

    public resize = (ctx: CanvasRenderingContext2D) => {
        this.width = ctx.canvas.width * 0.8;
        this.iy = 0.3;

        if (window.innerHeight < 800 || window.innerHeight > 1000) {
            this.iy = 0.18;
        }

        if (window.innerWidth <= 580 && window.innerHeight > 750) {
            this.iy = 0.25;
        }

        if (window.innerHeight < 700 || window.innerWidth > 1700) {
            this.width = ctx.canvas.width * 0.75;
        }

        if (window.innerWidth > 1700) {
            this.width = ctx.canvas.width * 0.75;
        }

        if (window.innerWidth <= 768) {
            this.width = ctx.canvas.width * 0.9;
        }

        // if (window.innerWidth <= 450) {
        //     this.width = ctx.canvas.width * 0.95;
        // }

        this.startX = (ctx.canvas.width - this.width) / 2;
        this.height = this.width / this.ratio;
        this.startY = ctx.canvas.height * this.iy - this.height / 2;
    };
}
