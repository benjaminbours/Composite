import Canvases from "../index";

export default class Canvas {
    public ctx: CanvasRenderingContext2D;

    constructor(ctxDom: HTMLCanvasElement) {
        this.ctx = ctxDom.getContext("2d") as CanvasRenderingContext2D;

        this.clear = this.clear.bind(this);
        this.resize = this.resize.bind(this);
    }

    protected renderBothComponents(color: string) {
        for (const sceneName in Canvases.bothComponents) {
            if (Canvases.bothComponents[sceneName]) {
                const scene = Canvases.bothComponents[sceneName];
                for (const comp in scene) {
                    if (scene[comp].hasOwnProperty("render")) {
                        if (scene[comp].isMount || scene[comp].onTransition) {
                            scene[comp].render(this.ctx, color);
                        }
                    }
                }
            }
        }
    }

    protected resize() {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

    protected clear() {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
}
