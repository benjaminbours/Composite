import MenuApp, { wave } from "../main";
import Mouse from "./Mouse";

// const waveViscosity = 20;
// const waveMouseDist = 20;
// const waveDamping = 0.01;
// const waveViscosity = 200;
// const waveMouseDist = 80;
// const waveDamping = 0.10;
// const waveViscosity = 200;
// const waveMouseDist = 100;
// const waveDamping = 0.10;

export default class Point {
    public isAnimating: boolean = false;
    public amplitude: number = Math.floor(Math.random() * wave.amplitudeRange);
    public random: number = Math.floor(Math.random() * wave.randomRange);
    public x: number;
    public y: number;
    public cx: number;
    public cy: number;
    public ix: number;
    public iy: number;
    private vx: number;
    private vy: number;
    private axis;
    private fixed: boolean;
    private canvas;
    private time: number = Date.now();

    constructor(x: number, y: number, axis: any, fixed: any, canvas: HTMLCanvasElement) {
        this.x = x;
        this.ix = x;
        this.vx = 0;
        this.y = y;
        this.iy = y;
        this.vy = 0;
        this.cx = 0;
        this.cy = 0;
        this.axis = axis;
        this.fixed = fixed;
        this.canvas = canvas;
    }

    public move = () => {
        if (this.fixed) {
            return;
        }

        this.vx += (this.ix - this.x) / wave.viscosity;
        this.vy += (this.iy - this.y) / wave.viscosity;
        const dx = this.ix - Mouse.x;
        const dy = this.iy - Mouse.y;

        const vGap = MenuApp.vGap;

        const isVerticalAxis = this.axis === "v";

        if ((isVerticalAxis && Mouse.directionX > 0 && Mouse.x > this.x) || (Mouse.directionX < 0 && Mouse.x < this.x)) {
            if ((this.axis === "v" && Math.sqrt(dx * dx) < wave.mouseDist && Math.sqrt(dy * dy) < vGap)) {
                if (this.axis === "v") {
                    this.vx = Mouse.speedX / 8;
                } else {
                    this.vx = 0;
                }
            }
        }

        if (this.axis === "v") {
            this.vx *= (1 - wave.damping);
            this.x += this.vx;
            this.y = this.iy;
        }
    }
}
