// local
import { ResizeOptions } from '../../types';

export default class Canvas {
    public ctx: CanvasRenderingContext2D;

    constructor(ctxDom: HTMLCanvasElement) {
        this.ctx = ctxDom.getContext('2d') as CanvasRenderingContext2D;

        this.clear = this.clear.bind(this);
        this.resize = this.resize.bind(this);
    }

    protected resize(_options: ResizeOptions) {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

    protected clear() {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
}
