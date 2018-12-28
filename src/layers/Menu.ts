import Curve from "../comps/Curve";
import Light from "../comps/ImageDrawer/Light";
import MainTitle from "../comps/MainTitle";
import TextDrawer from "../comps/TextDrawer";
import App from "../main";
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
                title: new TextDrawer(this.ctx, "white", "THINK BOTH WAYS"),
            },
        };
        this.light = new Light(this.ctx);
        window.addEventListener("resize", this.resize);
    }

    public render = () => {
        this.clear();
        this.ctx.save();
        this.curve.render();
        for (const comps in this.scenes.home) {
            if (this.scenes.home[comps].hasOwnProperty("render")) {
                if (this.scenes.home[comps].isMount || this.scenes.home[comps].onTransition) {
                    this.scenes.home[comps].render();
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
