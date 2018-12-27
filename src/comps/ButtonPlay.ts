import { TweenMax } from "gsap";
import Curve, { defaultWave, wave } from "./Curve";
import Shadow from "./ImageDrawer/Shadow";

export default class ButtonPlay {
    public static isMouseHover: boolean = false;
    public static isMouseEnter: boolean = false;
    public static isMouseExit: boolean = false;

    public ray: number = 45;
    private readonly ctx: CanvasRenderingContext2D;

    private startX: number = 0;
    private startY: number = 0;

    private color: string = "#000";
    private textColor: string = "#FFF";

    private width: number = 0;

    private circle = new Path2D();

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
        this.ctx.font = "100 20px sans-serif";
        this.ctx.fillStyle = this.textColor;
        this.ctx.fillText("PLAY", this.startX - this.width / 2, this.startY + 10);
        this.width = this.ctx.measureText("PLAY").width;
    }

    private detectMouseEvent = (event: MouseEvent) => {
        if (this.ctx.isPointInPath(this.circle, event.clientX, event.clientY)) {
            if (ButtonPlay.isMouseHover === false) {
                ButtonPlay.isMouseEnter = true;
            } else {
                ButtonPlay.isMouseEnter = false;
            }
            ButtonPlay.isMouseHover = true;
        } else {
            if (ButtonPlay.isMouseHover === true) {
                ButtonPlay.isMouseExit = true;
            } else {
                ButtonPlay.isMouseExit = false;
            }
            ButtonPlay.isMouseHover = false;
        }
    }

    private handleMousemove = (event: MouseEvent) => {
        this.detectMouseEvent(event);
        if (ButtonPlay.isMouseEnter) {
            this.handleMouseEnter();
        }

        if (ButtonPlay.isMouseExit) {
            this.handleMouseExit();
        }
    }

    private handleMouseEnter = () => {
        Curve.mouseIsHoverButton = true;
        Shadow.setRotationSpeed(0.02);
        Curve.transformWave({
            ...defaultWave,
            // en slow motion,
            // damping: 0.6,
            // courte mais agité,
            randomRange: 300,
            amplitudeRange: 50,
            speed: 0.1,
        });
        TweenMax.to(this, 0.5, {
            color: "#FFF",
            textColor: "#000",
            overwrite: "all",
            repeat: 0,
        });
    }

    private handleMouseExit = () => {
        Shadow.setRotationSpeed(0.005);
        Curve.mouseIsHoverButton = false;
        Curve.transformWave({
            ...defaultWave,
        });
        TweenMax.to(this, 0.5, {
            color: "#000",
            textColor: "#FFF",
            overwrite: "all",
        });
    }

    private resize = () => {
        this.startX = window.innerWidth / 2;
        this.startY = window.innerHeight / 100 * 75;
    }
}
