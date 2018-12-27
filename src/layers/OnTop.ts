import ButtonPlay from "../comps/ButtonPlay";

export default class OnTop {
    private ctxDom = document.querySelector("#onTop") as HTMLCanvasElement;
    private ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;

    private readonly buttonPlay: ButtonPlay;

    constructor() {
        this.resize();
        this.buttonPlay = new ButtonPlay(this.ctx);
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.clear();
        this.buttonPlay.render();
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

     private resize = () => {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }
}
