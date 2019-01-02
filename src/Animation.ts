import { Power3, TimelineMax, TweenMax } from "gsap";
import ButtonPlay from "./comps/ButtonPlay";
import { defaultWave, wave } from "./comps/Curve";
import App from "./main";

export default class Animation {
    public static homeToLevel() {
        console.log("home to level");
        const { curve, light } = App.layers.menu;
        const shadow = App.layers.underMenu.shadow;
        const buttonPlay = App.layers.onTop.scenes.home.buttonPlay as ButtonPlay;
        const canvas = App.layers.menu.ctx.canvas;
        const mainTitleWhite = App.layers.menu.scenes.home.mainTitle;
        const mainTitleBlack = App.layers.underMenu.scenes.home.mainTitle;
        const titleHomeWhite = App.layers.menu.scenes.home.title;
        const titleHomeBlack = App.layers.underMenu.scenes.home.title;

        const titleLevelWhite = App.layers.menu.scenes.level.title;
        const firstLevel = App.layers.onTop.scenes.level.first;

        App.layers.onTop.ctx.canvas.style.cursor = "initial";

        const tl = new TimelineMax();
        wave.viscosity = 40;
        wave.damping = 0.2;
        tl.to(curve, 0.5, {
            origin: canvas.width * 0.85,
            overwrite: "all",
            onComplete: () => {
                TweenMax.to(wave, 0.1, {
                    ...defaultWave,
                    overwrite: "all",
                });
            },
        });

        tl.to(light, 0.5, {
            startX: canvas.width * 0.85,
            startY: canvas.height * 0.5,
        }, "-= 0.5");

        tl.to(shadow, 0.5, {
            startX: canvas.width * 0.85,
            startY: canvas.height * 0.5,
        }, "-= 0.5");

        mainTitleBlack.onTransition = true;
        mainTitleWhite.onTransition = true;

        titleHomeBlack.onTransition = true;
        titleHomeWhite.onTransition = true;

        buttonPlay.onTransition = true;

        tl.to([mainTitleBlack, mainTitleWhite, titleHomeWhite, titleHomeBlack, buttonPlay], 0.5, {
            opacity: 0,
            overwrite: "all",
            onComplete: () => {
                mainTitleBlack.onTransition = false;
                mainTitleBlack.isMount = false;
                mainTitleWhite.onTransition = false;
                mainTitleWhite.isMount = false;

                titleHomeWhite.onTransition = false;
                titleHomeBlack.onTransition = false;
                titleHomeWhite.isMount = false;
                titleHomeBlack.isMount = false;

                buttonPlay.onTransition = false;
                buttonPlay.isMount = false;
                buttonPlay.isMouseHover = false;
                buttonPlay.isMouseEnter = false;
                buttonPlay.isMouseExit = false;
            },
        }, "-= 0.5");

        tl.to(shadow, 1, {
            rotationSpeed: 0.005,
            ease: Power3.easeOut,
        }, "-= 0.5");

        titleLevelWhite.onTransition = true;
        firstLevel.onTransition = true;
        tl.fromTo([titleLevelWhite, firstLevel], 0.5, {
            opacity: 0,
        }, {
            opacity: 1,
            // onComplete: () => {
            //     // first
            // }
        }, "-= 0.5");

        light.isPulsingFast = false;
    }
    public static mouseExitButtonPlay() {
        // console.log("mouse exit");
        const { curve, light } = App.layers.menu;
        const shadow = App.layers.underMenu.shadow;
        const buttonPlay = App.layers.onTop.scenes.home.buttonPlay;

        App.layers.onTop.ctx.canvas.style.cursor = "initial";
        curve.mouseIsHoverButton = false;
        const tl = new TimelineMax();
        tl.to(wave, 0.1, {
            ...defaultWave,
            overwrite: "all",
        });

        tl.to(shadow, 1, {
            rotationSpeed: 0.005,
            ease: Power3.easeOut,
        });

        light.isPulsingFast = false;

        tl.to(buttonPlay, 0.5, {
            color: "#000",
            textColor: "#FFF",
            // overwrite: "all",
        }, "-= 1");
    }

    public static mouseEnterButtonPlay() {
        // console.log("mouse enter");
        const { curve, light } = App.layers.menu;
        const shadow = App.layers.underMenu.shadow;
        const buttonPlay = App.layers.onTop.scenes.home.buttonPlay;

        App.layers.onTop.ctx.canvas.style.cursor = "pointer";
        curve.mouseIsHoverButton = true;
        const tl = new TimelineMax();
        tl.to(wave, 0.1, {
            ...defaultWave,
            // en slow motion,
            // damping: 0.6,
            // courte mais agité,
            randomRange: 300,
            amplitudeRange: 50,
            speed: 0.1,
            overwrite: "all",
        });

        tl.to(shadow, 1, {
            rotationSpeed: 0.02,
            ease: Power3.easeOut,
        }, "-= 0.1");

        // try to animate it smoothly.
        light.isPulsingFast = true;

        tl.to(buttonPlay, 0.5, {
            color: "#FFF",
            textColor: "#000",
            // overwrite: "all",
            repeat: 0,
        }, "-= 1");
    }
}
