import Curve from "../comps/Curve";
import Light from "../comps/Light";
import MainTitle from "../comps/MainTitle";
import TextDrawer from "../comps/TextDrawer";
import { Iscenes } from "../types";

export default class CanvasBlack {
    public ctx: CanvasRenderingContext2D;

    public scenes: Iscenes;

    public readonly curve: Curve;
    public readonly light: Light;

    constructor(ctxDom: HTMLCanvasElement) {
        this.ctx = ctxDom.getContext("2d") as CanvasRenderingContext2D;
        this.scenes = {
            home: {
                mainTitle: new MainTitle(this.ctx, "white"),
                title: new TextDrawer(this.ctx, "white", "THINK BOTH WAYS", true, {
                    x: 0.5,
                    y: 0.5,
                }),
            },
            faction: {
                title: new TextDrawer(this.ctx, "white", "SELECT A SIDE", false, {
                    x: 0.5,
                    y: 0.2,
                }),
            },
        };
        this.light = new Light(this.ctx);
        this.resize();
        this.curve = new Curve(this.ctx);
    }

    public render = () => {
        this.clear();
        this.ctx.save();
        this.curve.render();
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
        this.light.render();
        this.ctx.restore();
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

        this.light.resize();
        if (this.curve) {
            this.curve.resize();
        }
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
}
