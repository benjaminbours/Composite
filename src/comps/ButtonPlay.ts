import { TweenMax } from "gsap";

export default class ButtonPlay {
    public isMount: boolean = true;
    public onTransition: boolean = false;

    public isMouseHover: boolean = false;
    public isMouseEnter: boolean = false;
    public isMouseExit: boolean = false;
    public isOpen: boolean = false;

    public path = new Path2D();
    public ray: number = 45;
    private readonly ctx: CanvasRenderingContext2D;

    private color: string = "#000";
    private textColor: string = "#FFF";

    private startX: number = 0;
    private startY: number = 0;

    private width: number = 0;
    private opacity: number = 1;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.resize();

        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.arc(this.startX, this.startY, this.ray, 0, 2 * Math.PI);
        this.path.arc(this.startX, this.startY, this.ray, 0, 2 * Math.PI);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.canvas.style.letterSpacing = "5px";
        this.ctx.font = "100 20px sans-serif";
        this.ctx.fillStyle = this.textColor;
        this.ctx.fillText("PLAY", this.startX - this.width / 2, this.startY + 10);
        this.width = this.ctx.measureText("PLAY").width;
    }

    public disappear = () => {
        this.onTransition = true;
        TweenMax.to(this, 0.5, {
            opacity: 0,
            overwrite: "all",
            onComplete: () => {
                this.onTransition = false;
                this.isMount = false;
            },
        });
    }

    public handleMouseEnter = () => {
        TweenMax.to(this, 0.5, {
            color: "#FFF",
            textColor: "#000",
            // overwrite: "all",
            repeat: 0,
        });
    }

    public handleMouseExit = () => {
        TweenMax.to(this, 0.5, {
            color: "#000",
            textColor: "#FFF",
            // overwrite: "all",
        });
    }

    private resize = () => {
        this.startX = window.innerWidth / 2;
        this.startY = window.innerHeight / 100 * 75;
    }
}
