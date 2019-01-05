import { Power3, TimelineLite, TweenLite } from "gsap";
import React, { RefObject } from "react";
import Canvases from "./comps/Canvases";
import { defaultWave, wave } from "./comps/Canvases/comps/Curve/index";
import CanvasBlack from "./comps/Canvases/layers/CanvasBlack";
import CanvasWhite from "./comps/Canvases/layers/CanvasWhite";

interface IAnimationComps {
    buttonPlay: RefObject<HTMLButtonElement>;
    levelInterface: RefObject<HTMLDivElement>;
}

export default class Animation {
    public static mouseEnterButtonPlay: TweenLite;
    public static mouseLeaveButtonPlay: TweenLite;

    public static homeToLevel: TimelineLite;
    public static levelToHome: TimelineLite;

    public static components: IAnimationComps = {
        buttonPlay: React.createRef(),
        levelInterface: React.createRef(),
    };

    public static initHomeToLevel(onComplete: () => void) {
        const canvasBlack = Canvases.layers.black as CanvasBlack;
        const canvasWhite = Canvases.layers.white as CanvasWhite;
        const { curve, light } = canvasBlack;
        const { shadow } = canvasWhite;

        const canvas = Canvases.layers.white.ctx.canvas;
        const mainTitleWhite = canvasBlack.scenes.home.mainTitle;
        const titleHomeWhite = canvasBlack.scenes.home.title;

        const mainTitleBlack = canvasWhite.scenes.home.mainTitle;
        const titleHomeBlack = canvasWhite.scenes.home.title;

        const buttonPlay = this.components.buttonPlay.current as HTMLButtonElement;
        const levelInterface = this.components.levelInterface.current as HTMLElement;

        this.homeToLevel = new TimelineLite({
            paused: true,
            onComplete: () => {
                curve.mouseIsHoverButton = false;
                light.isPulsingFast = false;
                this.mouseLeaveButtonPlay.play();
                onComplete();
            },
        })
            .to(curve, 0.5, {
                origin: canvas.width * 0.85,
                onComplete: () => {
                    TweenLite.set(wave, {
                        ...defaultWave,
                    });
                },
            })
            .to([light, shadow], 0.5, {
                delay: 0.1,
                startX: canvas.width * 0.85,
                startY: canvas.height * 0.5,
            }, "-= 0.5")
            .to([mainTitleBlack, mainTitleWhite, titleHomeWhite, titleHomeBlack], 0.5, {
                opacity: 0,
                onComplete: () => {
                    mainTitleBlack.onTransition = false;
                    mainTitleBlack.isMount = false;
                    mainTitleWhite.onTransition = false;
                    mainTitleWhite.isMount = false;

                    titleHomeWhite.onTransition = false;
                    titleHomeBlack.onTransition = false;
                    titleHomeWhite.isMount = false;
                    titleHomeBlack.isMount = false;
                },
            }, "-= 0.5")
            .to(buttonPlay, 0.5, {
                opacity: 0,
            }, "-= 0.5")
            .to(levelInterface, 0.5, {
                opacity: 1,
                onStart: () => {
                    levelInterface.style.display = "block";
                },
            });
    }

    public static initLevelToHome(onComplete: () => void) {
        const canvasBlack = Canvases.layers.black as CanvasBlack;
        const canvasWhite = Canvases.layers.white as CanvasWhite;
        const { curve, light } = canvasBlack;
        const { shadow } = canvasWhite;

        const canvas = Canvases.layers.white.ctx.canvas;
        const mainTitleWhite = canvasBlack.scenes.home.mainTitle;
        const titleHomeWhite = canvasBlack.scenes.home.title;

        const mainTitleBlack = canvasWhite.scenes.home.mainTitle;
        const titleHomeBlack = canvasWhite.scenes.home.title;

        const buttonPlay = this.components.buttonPlay.current as HTMLButtonElement;
        const levelInterface = this.components.levelInterface.current as HTMLElement;

        this.levelToHome = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .to(curve, 0.5, {
                origin: canvas.width * 0.5,
                onComplete: () => {
                    TweenLite.set(wave, {
                        ...defaultWave,
                    });
                },
            })
            .to([light, shadow], 0.5, {
                delay: 0.1,
                startX: canvas.width * 0.5,
                startY: canvas.height * 0.75,
            }, "-= 0.5")
            .to(levelInterface, 0.5, {
                opacity: 0,
                onStart: () => {
                    levelInterface.style.display = "block";
                },
                onComplete: () => {
                    levelInterface.style.display = "none";
                },
            }, "-= 0.5")
            .to([mainTitleBlack, mainTitleWhite, titleHomeWhite, titleHomeBlack], 0.5, {
                opacity: 1,
                onStart: () => {
                    mainTitleBlack.onTransition = true;
                    mainTitleWhite.onTransition = true;

                    titleHomeWhite.onTransition = true;
                    titleHomeBlack.onTransition = true;
                },
                onComplete: () => {
                    mainTitleBlack.onTransition = false;
                    mainTitleWhite.onTransition = false;

                    titleHomeWhite.onTransition = false;
                    titleHomeBlack.onTransition = false;

                    mainTitleBlack.isMount = true;
                    mainTitleWhite.isMount = true;

                    titleHomeWhite.isMount = true;
                    titleHomeBlack.isMount = true;
                },
            })
            .to(buttonPlay, 0.5, {
                opacity: 1,
            }, "-= 0.5");
    }

    public static initMouseEnterButtonPlay() {
        const shadow = (Canvases.layers.white as CanvasWhite).shadow;

        this.mouseEnterButtonPlay = TweenLite.to(shadow, 1, {
            paused: true,
            rotationSpeed: 0.02,
            ease: Power3.easeOut,
            overwrite: "all",
        });
    }

    public static initMouseLeaveButtonPlay() {
        const shadow = (Canvases.layers.white as CanvasWhite).shadow;

        this.mouseLeaveButtonPlay = TweenLite.to(shadow, 1, {
            paused: true,
            rotationSpeed: 0.005,
            ease: Power3.easeOut,
            overwrite: "all",
        });
    }

    public static playHomeToLevel() {
        TweenLite.set(wave, {
            viscosity: 40,
            damping: 0.2,
            overwrite: "all",
        });
        this.homeToLevel.play(0);
    }

    public static playLevelToHome() {
        TweenLite.set(wave, {
            viscosity: 40,
            damping: 0.2,
            overwrite: "all",
        });
        this.levelToHome.play(0);
    }

    public static playMouseLeaveButtonPlay() {
        const { curve, light } = Canvases.layers.black as CanvasBlack;

        curve.mouseIsHoverButton = false;
        light.isPulsingFast = false;
        TweenLite.set(wave, {
            ...defaultWave,
        });
        this.mouseLeaveButtonPlay.play();
    }

    public static playMouseEnterButtonPlay() {
        const { curve, light } = Canvases.layers.black as CanvasBlack;

        curve.mouseIsHoverButton = true;
        light.isPulsingFast = true;
        TweenLite.set(wave, {
            randomRange: 300,
            amplitudeRange: 50,
            speed: 0.1,
        });
        this.mouseEnterButtonPlay.play();
    }
}
