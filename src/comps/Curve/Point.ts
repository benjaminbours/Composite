import Curve, { wave } from "./index";
import Mouse from "./Mouse";

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

    constructor(x: number, y: number, axis: any, fixed: any) {
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
    }

    public move = () => {
        if (this.fixed) {
            return;
        }

        this.vx += (this.ix - this.x) / wave.viscosity;
        this.vy += (this.iy - this.y) / wave.viscosity;
        const dx = this.ix - Mouse.x;
        const dy = this.iy - Mouse.y;

        const vGap = Curve.vGap;

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
