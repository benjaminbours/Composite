import { TweenMax } from "gsap";
import { Side } from "../../types";
import mainTitleBlackPath from "./composite_black.svg";
import mainTitleWhitePath from "./composite_white.svg";

const mainTitleWhite = new Image();
mainTitleWhite.src = mainTitleWhitePath;
const mainTitleBlack = new Image();
mainTitleBlack.src = mainTitleBlackPath;

export default class MainTitle {
    public isMount: boolean = true;
    public onTransition: boolean = false;
    public startX: number = 0;
    public startY: number = 0;

    private width: number = 1370;
    private height: number = 99;
    private ratio: number = this.width / this.height;

    private opacity: number = 1;

    constructor(isMount: boolean) {
        this.isMount = isMount;
    }

    public render = (ctx: CanvasRenderingContext2D, color: Side): boolean => {
        if (ctx.canvas.width <= 768 && color === "black") {
            return false;
        }
        const img = color === "black" ? mainTitleBlack : mainTitleWhite;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(img, this.startX, this.startY, this.width, this.height);
        ctx.restore();
        return true;
    }

    public resize = (ctx: CanvasRenderingContext2D) => {
        let positionY = 0.30;
        this.width = ctx.canvas.width * 0.80;

        if (window.innerHeight < 800) {
            positionY = 0.18;
        }

        if (window.innerHeight < 700 || window.innerWidth > 1700) {
            this.width = ctx.canvas.width * 0.75;
        }

        // if (window.innerWidth > 1700) {
        //     this.width = ctx.canvas.width * 0.75;
        // }

        if (window.innerWidth <= 768) {
            this.width = ctx.canvas.width * 0.9;
        }
        this.startX = (ctx.canvas.width - this.width) / 2;
        this.height = this.width / this.ratio;
        this.startY = ctx.canvas.height * positionY - this.height / 2;
    }
}
