import { getRndInteger } from "../helpers/getRndInteger";

function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) {
        return c / 2 * t * t + b;
    }
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
}

export interface ICoordinate {
    x: number;
    y: number;
}

export default class CurvePoint {
    public coordinate: ICoordinate;

    public readonly range: ICoordinate = {
        x: 80,
        y: 20,
    };

    public readonly rangeDuration = {
        min: 200,
        max: 400,
    };

    public readonly anchor: ICoordinate = {
        x: 0,
        y: 0,
    };

    public target: ICoordinate = {
        x: this.anchor.x + getRndInteger(0, this.range.x * 2) - this.range.x,
        y: this.anchor.y + getRndInteger(0, this.range.y * 2) - this.range.y,
    };

    public tick: number = 0;

    private initialCoordinate: ICoordinate = {
        ...this.coordinate,
    };

    private duration: number = getRndInteger(this.rangeDuration.min, this.rangeDuration.max);

    constructor(config: ICoordinate) {
        this.anchor = {
            ...config,
        };
        this.coordinate = {
            ...config,
        };

        this.setTarget();
    }

    public update = () => {
        const d: ICoordinate = {
            x: this.target.x - this.coordinate.x,
            y: this.target.y - this.coordinate.y,
        };

        const dist = Math.sqrt(d.x * d.x + d.y * d.y);

        if (Math.abs(dist) <= 0) {
            // this.setTarget();
        } else {
            const t = this.tick;
            let b = this.initialCoordinate.y;
            let c = this.target.y - this.initialCoordinate.y;
            let dur = this.duration;
            // this.coordinate.y = ease(t, b, c, dur);

            b = this.initialCoordinate.x;
            c = this.target.x - this.initialCoordinate.x;
            dur = this.duration;
            this.coordinate.x = ease(t, b, c, dur);

            this.tick++;
        }
    }

    public render = (ctx) => {
        ctx.beginPath();
        ctx.arc(this.coordinate.x, this.coordinate.y, 3, 0, Math.PI * 2, false);
        ctx.fillStyle = "#000";
        ctx.fill();
    }

    public setTarget = () => {
        this.initialCoordinate = {
            ...this.coordinate,
        };
        this.target = {
            x: this.anchor.x + getRndInteger(0, this.range.x * 2) - this.range.x,
            y: this.anchor.y + getRndInteger(0, this.range.y * 2) - this.range.y,
        };
        this.tick = 0;
        this.duration = getRndInteger(this.rangeDuration.min, this.rangeDuration.max);
    }
}
