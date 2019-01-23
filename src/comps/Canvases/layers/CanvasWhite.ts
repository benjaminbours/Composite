import MainTitle from "../comps/MainTitle";
import Shadow from "../comps/Shadow";
import SubtitleHome from "../comps/SubtitleHome";
import TextDrawer from "../comps/TextDrawer";
import { Iscenes } from "../types";

export default class CanvasWhite {
    public ctx: CanvasRenderingContext2D;

    public scenes: Iscenes;

    public readonly shadow: Shadow;

    constructor(ctxDom: HTMLCanvasElement) {
        this.ctx = ctxDom.getContext("2d") as CanvasRenderingContext2D;
        this.scenes = {
            home: {
                mainTitle: new MainTitle(this.ctx, "black"),
                title: new SubtitleHome(this.ctx, "black", "THINK BOTH WAYS", true),
            },
            faction: {
                title: new TextDrawer(this.ctx, "black", "SELECT A SIDE", false, {
                    x: 0.5,
                    y: 0.2,
                }),
            },
        };
        this.shadow = new Shadow(this.ctx);
        this.resize();
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

    public resize = () => {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;

        for (const sceneName in this.scenes) {
            if (this.scenes[sceneName]) {
                const scene = this.scenes[sceneName];
                for (const comps in scene) {
                    if (scene[comps].hasOwnProperty("resize")) {
                        if (scene[comps].isMount || scene[comps].onTransition) {
                            scene[comps].resize();
                        }
                    }
                }
            }
        }

        this.shadow.resize();
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
}
