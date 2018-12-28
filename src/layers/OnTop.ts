import ButtonPlay from "../comps/ButtonPlay";
import Mouse from "../Mouse";
import { Iscenes } from "../types";

export default class OnTop {
    public ctxDom = document.querySelector("#onTop") as HTMLCanvasElement;
    public ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;

    // public readonly buttonPlay: ButtonPlay;

    public scenes: Iscenes;

    constructor() {
        this.resize();
        this.scenes = {
            home: {
                buttonPlay: new ButtonPlay(this.ctx),
            },
        };
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.clear();
        for (const comps in this.scenes.home) {
            if (this.scenes.home[comps].hasOwnProperty("render")) {
                if (this.scenes.home[comps].isMount || this.scenes.home[comps].onTransition) {
                    this.scenes.home[comps].render();
                }
            }
        }
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

     private resize = () => {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }
}
