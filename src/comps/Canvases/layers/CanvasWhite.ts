import Shadow from "../comps/Shadow";
import Canvas from "./Canvas";

export default class CanvasWhite extends Canvas {
    public readonly shadow: Shadow;

    constructor(ctxDom: HTMLCanvasElement) {
        super(ctxDom);
        this.shadow = new Shadow(this.ctx);
        this.resize();
    }

    public render = () => {
        super.clear();
        super.renderBothComponents("black");
        this.shadow.render();
    }

    public resize = () => {
        super.resize();
        this.shadow.resize();
    }
}
