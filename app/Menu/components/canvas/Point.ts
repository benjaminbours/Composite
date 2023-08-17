import Mouse from './Mouse';
import Curve from './Curve';

export default class Point {
    public isAnimating: boolean = false;
    public amplitude: number = Math.floor(
        Math.random() * Curve.waveOptions.amplitudeRange,
    );
    public random: number = Math.floor(
        Math.random() * Curve.waveOptions.randomRange,
    );
    public x: number;
    public y: number;
    public cx: number;
    public cy: number;
    public ix: number;
    public iy: number;

    private vx: number;
    private vy: number;
    private axis: 'v' | 'h';

    constructor(x: number, y: number, axis: any) {
        this.x = x;
        this.ix = x;
        this.vx = 0;
        this.y = y;
        this.iy = y;
        this.vy = 0;
        this.cx = 0;
        this.cy = 0;
        this.axis = axis;
    }

    public move = () => {
        this.vx += (this.ix - this.x) / Curve.waveOptions.viscosity;
        this.vy += (this.iy - this.y) / Curve.waveOptions.viscosity;
        const dx = this.ix - Mouse.x;
        const dy = this.iy - Mouse.y;

        const vGap = Curve.vGap;
        const hGap = Curve.hGap;

        const isVerticalAxis = this.axis === 'v';
        const isHorizontalAxis = this.axis === 'h';

        if (
            (isVerticalAxis && Mouse.directionX > 0 && Mouse.x > this.x) ||
            (Mouse.directionX < 0 && Mouse.x < this.x) ||
            (isHorizontalAxis && Mouse.directionY > 0 && Mouse.y > this.y) ||
            (Mouse.directionY < 0 && Mouse.y < this.y)
        ) {
            if (
                (this.axis === 'v' &&
                    Math.sqrt(dx * dx) < Curve.waveOptions.mouseDist &&
                    Math.sqrt(dy * dy) < vGap) ||
                (this.axis === 'h' &&
                    Math.sqrt(dy * dy) < Curve.waveOptions.mouseDist &&
                    Math.sqrt(dx * dx) < hGap)
            ) {
                if (isVerticalAxis) {
                    this.vx = Mouse.speedX / 8;
                } else {
                    this.vx = 0;
                }

                if (isHorizontalAxis) {
                    this.vy = Mouse.speedY / 8;
                } else {
                    this.vy = 0;
                }
            }
        }

        if (isVerticalAxis) {
            this.vx *= 1 - Curve.waveOptions.damping;
            this.x += this.vx;
            this.y = this.iy;
        }

        if (isHorizontalAxis) {
            this.vy *= 1 - Curve.waveOptions.damping;
            this.y += this.vy;
            this.x = this.ix;
        }
    };
}
