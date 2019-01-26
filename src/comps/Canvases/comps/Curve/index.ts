// import * as dat from "dat.gui";
import { Power3, TweenMax } from "gsap";
import { app } from "../../../../App";
import { IWaveOptions } from "../../types";
import Point from "./Point";

export const defaultWave: IWaveOptions = {
    viscosity: 340,
    mouseDist: 200,
    damping: 0.1,
    amplitudeRange: 100,
    randomRange: 4,
    randomTransition: 5,
    amplitudeTransition: 1,
    speed: 0.02,
};

export const wave: IWaveOptions = {
    viscosity: 340,
    mouseDist: 200,
    damping: 0.1,
    amplitudeRange: 100,
    randomRange: 4,
    randomTransition: 5,
    amplitudeTransition: 1,
    speed: 0.02,
};

const resizeOptions = {
    home(width: number) {
        return width * 0.5;
    },
    level(width: number) {
        return width * 0.85;
    },
    faction(width: number) {
        return width * 0.5;
    },
};

export default class Curve {
    // maybe bad use of static property
    // public static gui = new dat.GUI();
    public static vTotalPoints = 15;
    public static hTotalPoints = 15;
    public static vGap = window.innerHeight / (Curve.vTotalPoints - 1);
    public static hGap = window.innerWidth / (Curve.hTotalPoints - 1);

    public mouseIsHoverButton = false;

    private origin: number = 0;

    private readonly ctx: CanvasRenderingContext2D;
    private vPoints: Point[] = [];
    private hPoints: Point[] = [];

    private mainColor: string = "#000";
    private time: number = Date.now();

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.resize();
        if (window.innerWidth <= 768) {
            this.initHPoints();
        } else {
            this.initVPoints();
        }
    }

    public render = () => {
        this.ctx.fillStyle = this.mainColor;

        this.ctx.beginPath();

        let arrayPoint: Point[] = [];
        if (window.innerWidth <= 768) {
            arrayPoint = this.hPoints;
            this.ctx.moveTo(0, this.ctx.canvas.height * 0.5);
        } else {
            arrayPoint = this.vPoints;
            this.ctx.moveTo(this.ctx.canvas.width * 0.5, 0);
        }

        for (let i = 0; i <= arrayPoint.length - 1; i++) {
            if (TweenMax.ticker.frame % 200 === 0 && !this.mouseIsHoverButton) {
                TweenMax.to(arrayPoint[i], wave.randomTransition, {
                    random: Math.floor(Math.random() * wave.randomRange),
                });

                TweenMax.to(arrayPoint[i], wave.amplitudeTransition, {
                    amplitude: Math.floor(Math.random() * wave.amplitudeRange),
                });
            }
            const waveValue = (Math.sin(i + this.time + arrayPoint[i].random)) * arrayPoint[i].amplitude;
            if (window.innerWidth <= 768) {
                arrayPoint[i].iy = this.origin + waveValue;
            } else {
                arrayPoint[i].ix = this.origin + waveValue;
            }
            arrayPoint[i].move();

            const p = arrayPoint[i];
            if (i < arrayPoint.length - 1) {
                if (i === 0) {
                    if (window.innerWidth <= 768) {
                        p.x = 0;
                    } else {
                        p.y = 0;
                    }
                    p.cx = p.x;
                    p.cy = p.y;
                } else {
                    p.cx = (p.x + arrayPoint[i + 1].x) / 2;
                    p.cy = (p.y + arrayPoint[i + 1].y) / 2;
                }
            } else {
                p.cx = p.x;
                p.cy = p.y;
            }
            this.ctx.bezierCurveTo(p.x, p.y, p.cx, p.cy, p.cx, p.cy);
        }

        if (window.innerWidth <= 768) {
            this.ctx.lineTo(this.ctx.canvas.width, 0);
            this.ctx.lineTo(0, 0);
        } else {
            this.ctx.lineTo(0, this.ctx.canvas.height);
            this.ctx.lineTo(0, 0);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.clip();

        this.time -= wave.speed;
    }

    public resize = () => {
        if (app) {
            if (window.innerWidth <= 768) {
                this.origin = this.ctx.canvas.height * 0.75;
            } else {
                this.origin = resizeOptions[app.state.currentScene](this.ctx.canvas.width);
            }

        }
    }

    private initVPoints = () => {
        for (let i = 0; i <= Curve.vTotalPoints - 1; i++) {
            this.vPoints.push(new Point(this.origin, i * Curve.vGap, "v"));
        }
    }

    private initHPoints = () => {
        for (let i = 0; i <= Curve.hTotalPoints - 1; i++) {
            this.hPoints.push(new Point(i * Curve.hGap, this.origin, "h"));
        }
    }
}
