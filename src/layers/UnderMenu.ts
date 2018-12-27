import Shadow from "../comps/ImageDrawer/Shadow";
import MainTitle from "../comps/MainTitle";
import TextDrawer from "../comps/TextDrawer";

export default class UnderMenu {
    private ctxDom = document.querySelector("#under") as HTMLCanvasElement;
    private ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;

    private readonly mainTitle: MainTitle;
    private readonly title: TextDrawer;
    private readonly shadow: Shadow;

    constructor() {
        this.resize();
        this.mainTitle = new MainTitle(this.ctx, "black");
        this.title = new TextDrawer(this.ctx, "black");
        this.shadow = new Shadow(this.ctx);
        window.addEventListener("resize", this.resize);
    }

    public render() {
        this.clear();
        this.mainTitle.render();
        this.title.render();
        this.shadow.render();
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    private resize = () => {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }
}
