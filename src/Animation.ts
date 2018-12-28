import ButtonPlay from "./comps/ButtonPlay";
import { defaultWave } from "./comps/Curve";
import App from "./main";

export default class Animation {
    public static homeToLevel() {
        // Maybe better to use a timeline
        App.layers.menu.curve.moveOrigin(App.layers.menu.ctx.canvas.width * 0.85);
        App.layers.menu.light.move((App.layers.menu.ctx.canvas.width * 0.85), App.layers.menu.ctx.canvas.height * 0.5);
        App.layers.menu.scenes.home.title.disappear();
        App.layers.menu.scenes.home.mainTitle.disappear();
        App.layers.underMenu.shadow.move((App.layers.menu.ctx.canvas.width * 0.85), App.layers.menu.ctx.canvas.height * 0.5);
        App.layers.underMenu.scenes.home.title.disappear();
        App.layers.underMenu.scenes.home.mainTitle.disappear();
        App.layers.onTop.scenes.home.buttonPlay.disappear();
    }
    public static mouseExitButtonPlay() {
        console.log("mouse exit");
        App.layers.onTop.ctx.canvas.style.cursor = "initial";
        App.layers.underMenu.shadow.setRotationSpeed(0.005);
        App.layers.menu.light.pulseFast(false);
        App.layers.menu.curve.mouseIsHoverButton = false;
        App.layers.menu.curve.transformWave({
            ...defaultWave,
        });
        if (App.layers.onTop.scenes.home.buttonPlay instanceof ButtonPlay) {
            App.layers.onTop.scenes.home.buttonPlay.handleMouseExit();
        }
    }

    public static mouseEnterButtonPlay() {
        App.layers.onTop.ctx.canvas.style.cursor = "pointer";
        App.layers.menu.curve.mouseIsHoverButton = true;
        App.layers.underMenu.shadow.setRotationSpeed(0.02);
        App.layers.menu.light.pulseFast(true);
        App.layers.menu.curve.transformWave({
            ...defaultWave,
            // en slow motion,
            // damping: 0.6,
            // courte mais agité,
            randomRange: 300,
            amplitudeRange: 50,
            speed: 0.1,
        });
        if (App.layers.onTop.scenes.home.buttonPlay instanceof ButtonPlay) {
            App.layers.onTop.scenes.home.buttonPlay.handleMouseEnter();
        }
    }
}
