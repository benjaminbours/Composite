import { Side } from '../types';
import TextDrawer from './TextDrawer';

const coordinate = {
    x: 0.5,
    y: 0.45,
};

export default class SubtitleHome extends TextDrawer {
    constructor(content: string, isMount: boolean) {
        super(content, isMount, coordinate);
    }

    public render = (ctx: CanvasRenderingContext2D, color: Side): boolean => {
        if (ctx.canvas.width <= 768) {
            return false;
        }

        super.render(ctx, color);
        return true;
    };

    public resize = (ctx: CanvasRenderingContext2D) => {
        super.resize(ctx);
        this.iy = coordinate.y;

        if (window.innerHeight < 800) {
            this.iy = 0.4;
        }

        if (window.innerWidth < 580) {
            this.iy = 0.35;
        }

        if (window.innerHeight < 700) {
            this.iy = 0.35;
        }

        if (window.innerHeight > 1000) {
            this.iy = 0.4;
        }

        if (window.innerWidth <= 400 && window.innerHeight < 700) {
            this.iy = 0.3;
            this.fontSize = 20;
        }

        if (window.innerWidth <= 400) {
            this.fontSize = 15;
        }
    };
}
