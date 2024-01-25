// local
import { ResizeOptions } from '../../types';
import Shadow from './Shadow';
import Canvas from './Canvas';

export default class CanvasWhite extends Canvas {
    public readonly shadow: Shadow;

    constructor(ctxDom: HTMLCanvasElement) {
        super(ctxDom);
        this.shadow = new Shadow(this.ctx);
    }

    public render = () => {
        super.clear();
        this.shadow.render();
    };

    public resize = (options: ResizeOptions) => {
        super.resize(options);
        this.shadow.resize(options);
    };
}
