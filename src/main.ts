import * as dat from "dat.gui";
import { TweenMax } from "gsap";
import Mouse from "./comps/Mouse";
import Point from "./comps/Point";

export const wave = {
    viscosity: 340,
    mouseDist: 54,
    damping: 0.1,
    amplitudeRange: 100,
    randomRange: 4,
    randomTransition: 5,
    speed: 0.02,
};
// export const wave = {
//     viscosity: 200,
//     mouseDist: 80,
//     damping: 0.1,
//     amplitudeRange: 101,
//     randomRange: 5,
//     speed: 0.02,
//     randomTransition: 3,
// };

export default class MenuApp {
    public static gui = new dat.GUI();
    public static vTotalPoints = 15;
    public static vGap = window.innerHeight / (MenuApp.vTotalPoints - 1);

    public random: number = Math.random() * 1;
    private ctxDom = document.querySelector("#menu") as HTMLCanvasElement;
    private ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;

    private vPoints: Point[] = [];

    private mainColor: string = "#000";
    private time: number = Date.now();
    private start: boolean = false;

    constructor() {
        document.addEventListener("mousemove", Mouse.handleMouseMove);
        document.addEventListener("click", () => {
            if (!this.start) {
                console.log("here I start");
                this.start = true;
            }
        });
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;

        this.initVPoints();

        const controller = MenuApp.gui.add(MenuApp, "vTotalPoints", 0, 30);
        controller.onFinishChange((value) => {
            MenuApp.vTotalPoints = Math.floor(value);
            MenuApp.vGap = window.innerHeight / (MenuApp.vTotalPoints - 1);
            this.initVPoints();
        });
        MenuApp.gui.add(wave, "viscosity", 0, 500);
        MenuApp.gui.add(wave, "mouseDist", 0, 500);
        MenuApp.gui.add(wave, "damping", 0, 1);
        MenuApp.gui.add(wave, "amplitudeRange", 1, 201);
        MenuApp.gui.add(wave, "randomRange", 1, 101);
        MenuApp.gui.add(wave, "randomTransition", 0, 10);
        MenuApp.gui.add(wave, "speed", -0.1, 0.1);
        Mouse.speed();
        TweenMax.ticker.addEventListener("tick", this.render);
        // TweenMax.ticker.fps();
        // this.render();
    }

    private initVPoints = () => {
        this.vPoints = [];
        for (let i = 0; i <= MenuApp.vTotalPoints - 1; i++) {
            // const startX = this.ctx.canvas.width * 0.5 + Math.sin(i * MenuApp.vGap + this.time) * 70;
            this.vPoints.push(new Point(this.ctx.canvas.width * 0.5, i * MenuApp.vGap, "v", false, this.ctxDom));
        }
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    private render = () => {
        // console.log(this.vPoints.length);
        this.clear();
        this.ctx.fillStyle = this.mainColor;

        for (let i = 0; i <= this.vPoints.length - 1; i++) {

            if (TweenMax.ticker.frame % 200 === 0) {
                TweenMax.to(this.vPoints[i], wave.randomTransition, {
                    random: Math.floor(Math.random() * wave.randomRange),
                    amplitude: Math.floor(Math.random() * wave.amplitudeRange),
                });
            }
            const waveValue = (Math.sin(i + this.time + this.vPoints[i].random)) * this.vPoints[i].amplitude;
            const origin = this.ctx.canvas.width * 0.5;
            this.vPoints[i].ix = origin + waveValue;
            // this.vPoints[i].iy = i * MenuApp.vGap;
            this.vPoints[i].move();
        }
        this.ctx.beginPath();
        this.ctx.moveTo(this.ctx.canvas.width * 0.5, 0);

        for (let i = 0; i <= this.vPoints.length - 1; i++) {
            const p = this.vPoints[i];
            if (i < this.vPoints.length - 1) {
                if (i === 0) {
                    p.y = 0;
                    p.cx = p.x;
                    p.cy = p.y;
                } else {
                    p.cx = (p.x + this.vPoints[i + 1].x) / 2;
                    p.cy = (p.y + this.vPoints[i + 1].y) / 2;
                }
            } else {
                p.cx = p.x;
                p.cy = p.y;
            }
            this.ctx.bezierCurveTo(p.x, p.y, p.cx, p.cy, p.cx, p.cy);
        }
        this.ctx.lineTo(0, this.ctx.canvas.height);
        this.ctx.lineTo(0, 0);
        this.ctx.closePath();
        this.ctx.fill();

        this.time -= wave.speed;
    }
}

const menu = new MenuApp();
