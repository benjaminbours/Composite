import MainTitle from "./comps/MainTitle";
import TextDrawer from "./comps/TextDrawer";

export default class UnderMenu {
    private ctxDom = document.querySelector("#under") as HTMLCanvasElement;
    private ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;

    private readonly mainTitle: MainTitle;
    private readonly title: TextDrawer;

    constructor() {
        this.resize();
        this.mainTitle = new MainTitle(this.ctx, "black");
        this.title = new TextDrawer(this.ctx, "black");
        window.addEventListener("resize", this.resize);
    }

    public render() {
        this.clear();
        this.mainTitle.render();
        // this.ctx.font = "30px sans-serif";
        this.title.render();
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    private resize = () => {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }
}
