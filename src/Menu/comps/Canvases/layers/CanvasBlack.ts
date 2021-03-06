import Curve from "../comps/Curve";
import Light from "../comps/Light";
import Canvas from "./Canvas";

export default class CanvasBlack extends Canvas {
    public readonly curve: Curve;
    public readonly light: Light;

    constructor(ctxDom: HTMLCanvasElement) {
        super(ctxDom);
        this.light = new Light(this.ctx);
        this.resize();
        this.curve = new Curve(this.ctx);
    }

    public render = () => {
        super.clear();
        this.ctx.save();
        this.curve.render();
        super.renderBothComponents("white");
        this.light.render();
        this.ctx.restore();
    }

    public resize = () => {
        super.resize();

        this.light.resize();
        if (this.curve) {
            this.curve.resize();
        }
    }
}
