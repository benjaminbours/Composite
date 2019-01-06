import { app } from "../../../../App";
import shadowPath from "./shadow.png";

const shadow = new Image();
shadow.src = shadowPath;

const resizeOptions = {
    home(width: number, height: number) {
        return {
            x: width * 0.5,
            y: height * 0.75,
        };
    },
    level(width: number, height: number) {
        return {
            x: width * 0.85,
            y: height * 0.5,
        };
    },
    faction(width: number, height: number) {
        return {
            x: width * 0.75,
            y: height * 0.5,
        };
    },
};

export default class Shadow {
    public startY: number = 30;
    public startX: number = 0;
    private rotation: number = 0;
    private width: number = 600;

    private img: HTMLImageElement;
    private rotationSpeed: number = 0.005;

    private readonly ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.startX = this.ctx.canvas.width * 0.5;
        this.startY = this.ctx.canvas.height * 0.75;
        this.img = shadow;
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.ctx.save();
        this.ctx.translate(this.startX, this.startY);
        this.ctx.rotate(this.rotation);
        this.rotation -= this.rotationSpeed;
        this.ctx.drawImage(this.img, -this.width / 2, -this.width / 2, this.width, this.width);
        this.ctx.restore();
    }

    private resize = () => {
        if (app) {
            const coordinate = resizeOptions[app.state.currentScene](this.ctx.canvas.width, this.ctx.canvas.height);
            this.startX = coordinate.x;
            this.startY = coordinate.y;
        }
    }

}
