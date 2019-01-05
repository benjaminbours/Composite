import Shadow from "../comps/ImageDrawer/Shadow";
import MainTitle from "../comps/MainTitle";
import TextDrawer from "../comps/TextDrawer";
import { Iscenes } from "../types";

export default class CanvasWhite {
    public ctx: CanvasRenderingContext2D;

    public scenes: Iscenes;

    public readonly shadow: Shadow;

    constructor(ctxDom: HTMLCanvasElement) {
        this.ctx = ctxDom.getContext("2d") as CanvasRenderingContext2D;
        this.resize();
        this.scenes = {
            home: {
                mainTitle: new MainTitle(this.ctx, "black"),
                title: new TextDrawer(this.ctx, "black", "THINK BOTH WAYS", true, {
                    x: this.ctx.canvas.width / 2,
                    y: this.ctx.canvas.height / 100 * 50,
                }),
            },
            faction: {
                title: new TextDrawer(this.ctx, "black", "SELECT A SIDE", false, {
                    x: this.ctx.canvas.width * 0.5,
                    y: 180,
                }),
            },
        };
        this.shadow = new Shadow(this.ctx);
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
