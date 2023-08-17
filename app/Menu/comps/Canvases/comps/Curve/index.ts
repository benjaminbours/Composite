import { gsap } from 'gsap';
import Point from './Point';
import { IWaveOptions, ResizeOptions } from '../../../../types';

export const defaultWaveOptions: IWaveOptions = {
    viscosity: 340,
    mouseDist: 200,
    damping: 0.1,
    amplitudeRange: 100,
    randomRange: 4,
    randomTransition: 5,
    amplitudeTransition: 1,
    speed: 0.02,
};

export default class Curve {
    public static vTotalPoints = 15;
    public static hTotalPoints = 8;
    public static vGap = window.innerHeight / (Curve.vTotalPoints - 1);
    public static hGap = window.innerWidth / (Curve.hTotalPoints - 1);

    public static waveOptions = defaultWaveOptions;

    public static setWaveOptions = (newWaveOptions: Partial<IWaveOptions>) => {
        Curve.waveOptions = {
            ...Curve.waveOptions,
            ...newWaveOptions,
        };
    };

    public mouseIsHoverButton = false;

    public axis: 'h' | 'v' = 'v';

    public resizeOptions = {
        home(width: number, height: number, isOnMobile: boolean) {
            if (isOnMobile) {
                return height * 0.75;
            }
            return width * 0.5;
        },
        level(width: number, height: number, isOnMobile: boolean) {
            if (isOnMobile) {
                return height * 0.5;
            }
            return width * 0.85;
        },
        faction(width: number, height: number, isOnMobile: boolean) {
            if (isOnMobile) {
                return height * 0.5;
            }
            return width * 0.5;
        },
        queue(
            width: number,
            height: number,
            isOnMobile: boolean,
            faction: string,
        ) {
            const position = faction === 'light' ? 1.2 : -0.2;
            if (isOnMobile) {
                return height * position;
            }
            return width * position;
        },
    };

    private origin: number = 0;

    private readonly ctx: CanvasRenderingContext2D;
    private vPoints: Point[] = [];
    private hPoints: Point[] = [];

    private mainColor: string = '#000';
    private time: number = Date.now();

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    public render = () => {
        this.ctx.fillStyle = this.mainColor;

        this.ctx.beginPath();

        let arrayPoint: Point[] = [];

        if (this.axis === 'h') {
            arrayPoint = this.hPoints;
            this.ctx.moveTo(0, this.ctx.canvas.height * 0.5);
        } else {
            arrayPoint = this.vPoints;
            this.ctx.moveTo(this.ctx.canvas.width * 0.5, 0);
        }

        for (let i = 0; i <= arrayPoint.length - 1; i++) {
            if (gsap.ticker.frame % 200 === 0 && !this.mouseIsHoverButton) {
                gsap.to(arrayPoint[i], {
                    duration: Curve.waveOptions.randomTransition,
                    random: Math.floor(
                        Math.random() * Curve.waveOptions.randomRange,
                    ),
                });

                gsap.to(arrayPoint[i], {
                    duration: Curve.waveOptions.amplitudeTransition,
                    amplitude: Math.floor(
                        Math.random() * Curve.waveOptions.amplitudeRange,
                    ),
                });
            }
            const waveValue =
                Math.sin(i + this.time + arrayPoint[i].random) *
                arrayPoint[i].amplitude;

            if (this.axis === 'h') {
                arrayPoint[i].iy = this.origin + waveValue;
            } else {
                arrayPoint[i].ix = this.origin + waveValue;
            }

            arrayPoint[i].move();

            const p = arrayPoint[i];
            if (i < arrayPoint.length - 1) {
                if (i === 0) {
                    if (this.axis === 'h') {
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

        if (this.axis === 'h') {
            this.ctx.lineTo(this.ctx.canvas.width, 0);
            this.ctx.lineTo(0, 0);
        } else {
            this.ctx.lineTo(0, this.ctx.canvas.height);
            this.ctx.lineTo(0, 0);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.clip();

        this.time -= Curve.waveOptions.speed;
    };

    public resize = (options: ResizeOptions) => {
        Curve.vGap = window.innerHeight / (Curve.vTotalPoints - 1);
        Curve.hGap = window.innerWidth / (Curve.hTotalPoints - 1);
        if (options.isMobileDevice) {
            this.axis = 'h';
        } else {
            this.axis = 'v';
        }

        this.origin = this.resizeOptions[options.currentScene](
            this.ctx.canvas.width,
            this.ctx.canvas.height,
            options.isMobileDevice,
            options.side,
        );

        this.init();
    };

    private init = () => {
        if (this.axis === 'h') {
            // reset the current array before fill with news points.
            this.hPoints = [];
            for (let i = 0; i <= Curve.hTotalPoints - 1; i++) {
                this.hPoints.push(new Point(i * Curve.hGap, this.origin, 'h'));
            }
        } else {
            // reset the current array before fill with news points.
            this.vPoints = [];
            for (let i = 0; i <= Curve.vTotalPoints - 1; i++) {
                this.vPoints.push(new Point(this.origin, i * Curve.vGap, 'v'));
            }
        }
    };
}
