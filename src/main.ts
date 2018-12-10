import Curve from "./comps/Curve";

// cmd + shift + .
class MenuApp {
    private ctxDom = document.querySelector("#menu") as HTMLCanvasElement;
    private ctx = this.ctxDom.getContext("2d") as CanvasRenderingContext2D;
    private curve = new Curve();

    constructor() {
        this.ctx.canvas.width  = window.innerWidth;
        this.ctx.canvas.height = window.innerHeight;
        // window.addEventListener("resize", () => {
        //     this.app.renderer.resize(window.innerWidth, window.innerHeight);
        // });
        this.render();
    }

    private clear = () => {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    private render = () => {
        this.clear();
        this.curve.render(this.ctx);

        requestAnimationFrame(this.render);
    }
}

const menu = new MenuApp();
