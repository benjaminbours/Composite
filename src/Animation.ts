import { Power3, TimelineLite, TweenLite } from "gsap";
import React, { RefObject } from "react";
import Canvases from "./comps/Canvases";
import Curve, { defaultWave, wave } from "./comps/Canvases/comps/Curve/index";
import Light from "./comps/Canvases/comps/Light";
import Shadow from "./comps/Canvases/comps/Shadow";
import CanvasBlack from "./comps/Canvases/layers/CanvasBlack";
import CanvasWhite from "./comps/Canvases/layers/CanvasWhite";
import { Components } from "./comps/Canvases/types";

interface IAnimationComps {
    buttonPlay: RefObject<HTMLButtonElement>;
    levelInterface: RefObject<HTMLDivElement>;
    factionInterface: RefObject<HTMLDivElement>;
    queueInterface: RefObject<HTMLDivElement>;
}

interface IAnimationCanvasComps {
    canvas: HTMLCanvasElement;
    curve: Curve;
    shadow: Shadow;
    light: Light;
    mainTitleBlack: Components;
    mainTitleWhite: Components;
    titleHomeBlack: Components;
    titleHomeWhite: Components;
    titleFactionBlack: Components;
    titleFactionWhite: Components;
}

export default class Animation {
    public static mouseEnterButtonPlay: TweenLite;
    public static mouseLeaveButtonPlay: TweenLite;

    public static homeToLevel: TimelineLite;
    public static levelToHome: TimelineLite;
    public static levelToFaction: TimelineLite;
    public static factionToLevel: TimelineLite;
    public static factionToQueue: TimelineLite;

    public static components: IAnimationComps = {
        buttonPlay: React.createRef(),
        levelInterface: React.createRef(),
        factionInterface: React.createRef(),
        queueInterface: React.createRef(),
    };

    public static canvasComponents: IAnimationCanvasComps;

    public static initComponents() {
        this.canvasComponents = {
            curve: (Canvases.layers.black as CanvasBlack).curve,
            light: (Canvases.layers.black as CanvasBlack).light,
            shadow: (Canvases.layers.white as CanvasWhite).shadow,
            canvas: (Canvases.layers.white as CanvasWhite).ctx.canvas,
            mainTitleBlack: (Canvases.layers.black as CanvasBlack).scenes.home.mainTitle,
            mainTitleWhite: (Canvases.layers.white as CanvasWhite).scenes.home.mainTitle,
            titleHomeBlack: (Canvases.layers.black as CanvasBlack).scenes.home.title,
            titleHomeWhite: (Canvases.layers.white as CanvasWhite).scenes.home.title,
            titleFactionBlack: (Canvases.layers.white as CanvasWhite).scenes.faction.title,
            titleFactionWhite: (Canvases.layers.black as CanvasBlack).scenes.faction.title,
        };
    }

    public static initHomeToLevel(onComplete: () => void) {
        const {
            canvas,
            curve,
            shadow,
            light,
            mainTitleBlack,
            mainTitleWhite,
            titleHomeBlack,
            titleHomeWhite,
        } = this.canvasComponents;

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
                onComplete: this.setWaveInDefaultMode,
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
        const {
            canvas,
            curve,
            shadow,
            light,
            mainTitleBlack,
            mainTitleWhite,
            titleHomeBlack,
            titleHomeWhite,
        } = this.canvasComponents;

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
                onComplete: this.setWaveInDefaultMode,
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

    public static initLevelToFaction(onComplete: () => void) {
        const {
            canvas,
            curve,
            shadow,
            light,
            titleFactionBlack,
            titleFactionWhite,
        } = this.canvasComponents;

        const levelInterface = this.components.levelInterface.current as HTMLElement;
        const factionInterface = this.components.factionInterface.current as HTMLElement;

        this.levelToFaction = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .to(curve, 0.5, {
                origin: canvas.width * 0.5,
                onComplete: this.setWaveInDefaultMode,
            })
            .to(light, 0.5, {
                delay: 0.1,
                startX: canvas.width * 0.25,
                startY: canvas.height * 0.5,
            }, "-= 0.5")
            .to(shadow, 0.5, {
                delay: 0.1,
                startX: canvas.width * 0.75,
                startY: canvas.height * 0.5,
            }, "-= 0.5")
            .to(levelInterface, 0.5, {
                opacity: 0,
                onComplete: () => {
                    levelInterface.style.display = "none";
                },
            }, "-= 0.5")
            .to(factionInterface, 0.5, {
                opacity: 1,
                onStart: () => {
                    factionInterface.style.display = "block";
                },
            })
            .to([titleFactionBlack, titleFactionWhite], 0.5, {
                opacity: 1,
                onStart: () => {
                    titleFactionBlack.onTransition = true;
                    titleFactionWhite.onTransition = true;
                },
                onComplete: () => {
                    titleFactionBlack.onTransition = false;
                    titleFactionWhite.onTransition = false;

                    titleFactionBlack.isMount = true;
                    titleFactionWhite.isMount = true;
                },
            }, "-= 0.5");
    }

    public static initFactionToLevel(onComplete: () => void) {
        const {
            canvas,
            curve,
            shadow,
            light,
            titleFactionBlack,
            titleFactionWhite,
        } = this.canvasComponents;

        const levelInterface = this.components.levelInterface.current as HTMLElement;
        const factionInterface = this.components.factionInterface.current as HTMLElement;

        this.factionToLevel = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .to(curve, 0.5, {
                origin: canvas.width * 0.85,
                onComplete: this.setWaveInDefaultMode,
            })
            .to([light, shadow], 0.5, {
                delay: 0.1,
                startX: canvas.width * 0.85,
                startY: canvas.height * 0.5,
            }, "-= 0.5")
            .to(factionInterface, 0.5, {
                opacity: 0,
                onComplete: () => {
                    factionInterface.style.display = "none";
                },
            }, "-= 0.5")
            .to([titleFactionBlack, titleFactionWhite], 0.5, {
                opacity: 0,
                onStart: () => {
                    titleFactionBlack.onTransition = true;
                    titleFactionWhite.onTransition = true;
                },
                onComplete: () => {
                    titleFactionBlack.onTransition = false;
                    titleFactionWhite.onTransition = false;

                    titleFactionBlack.isMount = false;
                    titleFactionWhite.isMount = false;
                },
            }, "-= 0.5")
            .to(levelInterface, 0.5, {
                opacity: 1,
                onStart: () => {
                    levelInterface.style.display = "block";
                },
            });
    }

    public static initFactionToQueue(onComplete: () => void, faction: string) {
        const {
            canvas,
            curve,
            shadow,
            light,
            titleFactionBlack,
            titleFactionWhite,
        } = this.canvasComponents;

        const factionInterface = this.components.factionInterface.current as HTMLElement;
        const queueInterface = this.components.queueInterface.current as HTMLElement;

        const curveTarget = faction === "light" ? canvas.width * 1.2 : canvas.width * -0.2;
        const lightTarget = faction === "light" ? canvas.width * 0.5 : canvas.width * -0.5;
        const shadowTarget = faction === "light" ? canvas.width * 1.5 : canvas.width * 0.5;

        this.factionToQueue = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .to(curve, 0.5, {
                origin: curveTarget,
                onComplete: this.setWaveInDefaultMode,
            })
            .to(light, 0.5, {
                delay: 0.1,
                startX: lightTarget,
            }, "-= 0.5")
            .to(shadow, 0.5, {
                delay: 0.1,
                startX: shadowTarget,
            }, "-= 0.5")
            .to([titleFactionBlack, titleFactionWhite], 0.5, {
                opacity: 0,
                onStart: () => {
                    titleFactionBlack.onTransition = true;
                    titleFactionWhite.onTransition = true;
                },
                onComplete: () => {
                    titleFactionBlack.onTransition = false;
                    titleFactionWhite.onTransition = false;

                    titleFactionBlack.isMount = false;
                    titleFactionWhite.isMount = false;
                },
            }, "-= 0.5")
            .to(factionInterface, 0.5, {
                opacity: 0,
                onComplete: () => {
                    factionInterface.style.display = "none";
                },
            }, "-= 0.5")
            .to(queueInterface, 0.5, {
                opacity: 1,
                onStart: () => {
                    queueInterface.style.display = "block";
                },
            });
    }

    public static initMouseEnterButtonPlay() {
        const { shadow } = this.canvasComponents;

        this.mouseEnterButtonPlay = TweenLite.to(shadow, 1, {
            paused: true,
            rotationSpeed: 0.02,
            ease: Power3.easeOut,
            overwrite: "all",
        });
    }

    public static initMouseLeaveButtonPlay() {
        const { shadow } = this.canvasComponents;

        this.mouseLeaveButtonPlay = TweenLite.to(shadow, 1, {
            paused: true,
            rotationSpeed: 0.005,
            ease: Power3.easeOut,
            overwrite: "all",
        });
    }

    public static playHomeToLevel() {
        this.setWaveInMoveMode();
        this.homeToLevel.play(0);
    }

    public static playLevelToHome() {
        this.setWaveInMoveMode();
        this.levelToHome.play(0);
    }

    public static playLevelToFaction() {
        this.setWaveInMoveMode();
        this.levelToFaction.play(0);
    }

    public static playFactionToLevel() {
        this.setWaveInMoveMode();
        this.factionToLevel.play(0);
    }

    public static playFactionToQueue() {
        this.setWaveInMoveMode();
        this.factionToQueue.play(0);
    }

    public static playMouseLeaveButtonPlay() {
        const { curve, light } = this.canvasComponents;

        curve.mouseIsHoverButton = false;
        light.isPulsingFast = false;
        this.setWaveInDefaultMode();
        this.mouseLeaveButtonPlay.play();
    }

    public static playMouseEnterButtonPlay() {
        const { curve, light } = this.canvasComponents;

        curve.mouseIsHoverButton = true;
        light.isPulsingFast = true;
        TweenLite.set(wave, {
            randomRange: 300,
            amplitudeRange: 50,
            speed: 0.1,
        });
        this.mouseEnterButtonPlay.play();
    }

    public static setWaveInMoveMode() {
        TweenLite.set(wave, {
            viscosity: 40,
            damping: 0.2,
            overwrite: "all",
        });
    }

    public static setWaveInDefaultMode() {
        TweenLite.set(wave, {
            ...defaultWave,
        });
    }
}
