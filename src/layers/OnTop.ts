import ButtonPlay from "../comps/ButtonPlay";
import { Iscenes } from "../types";

export default class OnTop {
    public ctxDom = document.querySelector("#onTop") as HTMLCanvasElement;
    public ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;

    public scenes: Iscenes;

    constructor() {
        this.resize();
        this.scenes = {
            home: {
                buttonPlay: new ButtonPlay(this.ctx),
            },
            level: {},
        };
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.clear();
        for (const sceneName in this.scenes) {
            if (this.scenes[sceneName]) {
                const scene = this.scenes[sceneName];
                for (const comps in scene) {
                    if (scene[comps].hasOwnProperty("render")) {
                        if (scene[comps].isMount || scene[comps].onTransition) {
                            scene[comps].render();
                        }
                    }
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
