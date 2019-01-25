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
        this.width = ctx.canvas.width * 0.9;
        this.startX = (ctx.canvas.width - this.width) / 2;
        this.height = this.width / this.ratio;
        this.startY = ctx.canvas.height * 0.30 - this.height / 2;
    }
}
