import Shadow from "../comps/Shadow";
import SubtitleHome from "../comps/SubtitleHome";
import TextDrawer from "../comps/TextDrawer";
import { Iscenes } from "../types";
import Canvas from "./Canvas";

export default class CanvasWhite extends Canvas {
    public scenes: Iscenes;

    public readonly shadow: Shadow;

    constructor(ctxDom: HTMLCanvasElement) {
        super(ctxDom);
        this.scenes = {
            faction: {
                title: new TextDrawer(this.ctx, "black", "SELECT A SIDE", false, {
                    x: 0.5,
                    y: 0.2,
                }),
            },
        };
        console.log(this.ctx.canvas.width);
        this.shadow = new Shadow(this.ctx);
        this.resize();
        if (this.ctx.canvas.width > 768) {
            console.log("here");
            this.scenes.home = {
                // mainTitle: new MainTitle(this.ctx, "black"),
                title: new SubtitleHome(this.ctx, "black", "THINK BOTH WAYS", true),
            };
        }
    }

    public render = () => {
        super.clear();
        super.renderBothComponents("black");
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
        super.resize();
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
}
