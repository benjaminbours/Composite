import * as PIXI from "pixi.js";
import ButtonPlay from "./ButtonPlay";

const defaultIcon = "url('./images/frontend_backend.png'),auto";
const hoverIcon = "url('./images/hover_pointer.svg'),auto";

// cmd + shift + .

class MenuApp {
    private readonly app: PIXI.Application;
    private stage = new PIXI.Container();

    constructor() {
        const canvasMenu = document.querySelector("#menu") as HTMLCanvasElement;

        this.app = new PIXI.Application();

        this.app.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, {
            view: canvasMenu,
            antialias: true,
            resolution: 2,
        });
        this.app.renderer.autoResize = true;

        this.app.renderer.plugins.interaction.cursorStyles.default = defaultIcon;
        this.app.renderer.plugins.interaction.cursorStyles.hover = hoverIcon;

        window.addEventListener("resize", () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        });

        this.init();
    }

    private init() {
        // this.stage.interactive = true;
        // this.stage.cursor = "default"
        this.stage.width = this.app.screen.width;
        this.stage.height = this.app.screen.height;
        this.stage.x = 0;
        this.stage.y = 0;
        const buttonPlay = new ButtonPlay();
        this.stage.addChild(buttonPlay);
        // this.stage.scale.set(1, 1);
        console.log(this.stage);
        // this.stage.interactive = true;
        // this.stage.cursor = "default";
        this.app.stage.addChild(this.stage);
        // this.app.renderer.render(this.stage);
        this.loop();
    }

    private loop = () => {
        this.app.renderer.render(this.stage);

        this.stage.children.forEach((item) => {
            if (item instanceof ButtonPlay) {
                item.render();
            }
        });

        requestAnimationFrame(this.loop);
    }
}

const menu = new MenuApp();
