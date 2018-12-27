import { TweenMax } from "gsap";

export default class ButtonPlay {
    public ray: number = 45;
    private readonly ctx: CanvasRenderingContext2D;

    private startX: number = 0;
    private startY: number = 0;

    private color: string = "#000";
    private textColor: string = "#FFF";

    private width: number = 0;

    private circle = new Path2D();

    private isMouseHover: boolean = false;
    private isMouseEnter: boolean = false;
    private isMouseExit: boolean = false;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.ctx.canvas.addEventListener("mousemove", this.handleMousemove);
        this.resize();

        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.startX, this.startY, this.ray, 0, 2 * Math.PI);
        this.circle.arc(this.startX, this.startY, this.ray, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.canvas.style.letterSpacing = "5px";
        this.ctx.font = "400 20px sans-serif";
        this.ctx.fillStyle = this.textColor;
        this.ctx.fillText("PLAY", this.startX - this.width / 2, this.startY + 10);
        this.width = this.ctx.measureText("PLAY").width;
    }

    private handleMousemove = (event: MouseEvent) => {
        if (this.ctx.isPointInPath(this.circle, event.clientX, event.clientY)) {
            if (this.isMouseHover === false) {
                this.isMouseEnter = true;
            } else {
                this.isMouseEnter = false;
            }
            this.isMouseHover = true;
        } else {
            if (this.isMouseHover === true) {
                this.isMouseExit = true;
            } else {
                this.isMouseExit = false;
            }
            this.isMouseHover = false;
        }

        // console.log(this.isMouseExit, "exit");
        // console.log(this.isMouseEnter, "enter");

        if (this.isMouseEnter) {
            TweenMax.to(this, 0.5, {
                color: "#FFF",
                textColor: "#000",
                overwrite: "all",
                repeat: 0,
            });
        }

        if (this.isMouseExit) {
            TweenMax.to(this, 0.5, {
                color: "#000",
                textColor: "#FFF",
                overwrite: "all",
            });
        }
    }

    private resize = () => {
        this.startX = window.innerWidth / 2;
        this.startY = window.innerHeight / 100 * 75;
    }
}
