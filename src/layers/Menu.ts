import Curve from "../comps/Curve";
import Light from "../comps/ImageDrawer/Light";
import MainTitle from "../comps/MainTitle";
import TextDrawer from "../comps/TextDrawer";
import { Iscenes } from "../types";

export default class Menu {
    public ctxDom = document.querySelector("#menu") as HTMLCanvasElement;
    public ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;

    public scenes: Iscenes;

    public readonly curve: Curve;
    public readonly light: Light;

    constructor() {
        this.resize();
        this.curve = new Curve(this.ctx);
        this.scenes = {
            home: {
                mainTitle: new MainTitle(this.ctx, "white"),
                title: new TextDrawer(this.ctx, "white", "THINK BOTH WAYS", true, {
                    x: this.ctx.canvas.width / 2,
                    y: this.ctx.canvas.height / 100 * 50,
                }),
            },
            level: {
                title: new TextDrawer(this.ctx, "white", "SELECT A LEVEL", false, {
                    x: this.ctx.canvas.width / 2,
                    y: this.ctx.canvas.height / 100 * 15,
                }),
            },
        };
        this.light = new Light(this.ctx);
        window.addEventListener("resize", this.resize);
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

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    private resize = () => {
        this.ctx.canvas.width = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
    }

}
