import Curve from "./comps/Curve";
import MainTitle from "./comps/MainTitle";
import TextDrawer from "./comps/TextDrawer";

export default class Menu {
    private ctxDom = document.querySelector("#menu") as HTMLCanvasElement;
    private ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;
    private readonly curve: Curve;
    private readonly mainTitle: MainTitle;
    private readonly title: TextDrawer;

    constructor() {
        this.resize();
        this.curve = new Curve(this.ctx);
        this.mainTitle = new MainTitle(this.ctx, "white");
        this.title = new TextDrawer(this.ctx, "white");
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.clear();
        this.ctx.save();
        this.curve.render();
        this.mainTitle.render();
        this.title.render();
        this.ctx.restore();
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    private resize = () => {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

}
