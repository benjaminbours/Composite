import { Power3, TimelineLite, TweenLite } from "gsap";
import React, { RefObject } from "react";
import Canvases from "./comps/Canvases";
import { bothComponents } from "./comps/Canvases/bothComponents";
import {
    Light,
    MainTitle,
    Shadow,
    SubtitleHome,
    TextDrawer,
} from "./comps/Canvases/comps";
import Curve, { defaultWaveOptions, waveOptions } from "./comps/Canvases/comps/Curve";
import CanvasBlack from "./comps/Canvases/layers/CanvasBlack";
import CanvasWhite from "./comps/Canvases/layers/CanvasWhite";
import {
    curveCenter,
    curveQueue,
    curveLevel,
    lightCenter,
    lightOut,
    lightLevel,
    lightFaction,
    shadowCenter,
    shadowOut,
    shadowLevel,
    shadowFaction,
    levelInterfaceOut,
    factionInterfaceOut,
    factionInterfaceIn,
    queueInterfaceIn,
    queueInterfaceOut,
    titleFactionOut,
    titleFactionIn,
} from "./tweens";

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
    mainTitle: MainTitle;
    subtitleHome: SubtitleHome;
    titleFaction: TextDrawer;
}

export default class Animation {
    public static mouseEnterButtonPlay: TweenLite;
    public static mouseLeaveButtonPlay: TweenLite;

    public static homeToLevel: TimelineLite;
    public static levelToHome: TimelineLite;
    public static levelToFaction: TimelineLite;
    public static factionToLevel: TimelineLite;
    public static factionToQueueShadow: TimelineLite;
    public static factionToQueueLight: TimelineLite;
    public static queueToFaction: TimelineLite;

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
            mainTitle: bothComponents.home.mainTitle,
            subtitleHome: bothComponents.home.title,
            titleFaction: bothComponents.faction.title,
        };
    }

    public static initHomeToLevel(onComplete: () => void) {
        const {
            canvas,
            curve,
            shadow,
            light,
            mainTitle,
            subtitleHome,
        } = this.canvasComponents;

        const buttonPlay = this.components.buttonPlay.current as HTMLButtonElement;
        const levelInterface = this.components.levelInterface.current as HTMLElement;

        const isMobileDevise = window.innerWidth <= 768;

        this.homeToLevel = new TimelineLite({
            paused: true,
            onComplete: () => {
                curve.mouseIsHoverButton = false;
                light.isPulsingFast = false;
                this.mouseLeaveButtonPlay.play();
                onComplete();
            },
        })
            .add(curveLevel())
            .add([lightLevel(), shadowLevel()], "-= 0.5")
            // .to(curve, 0.5, {
            //     origin: curve.resizeOptions.level(canvas.width, canvas.height, isMobileDevise),
            //     onComplete: this.setWaveInDefaultMode,
            // })
            // .to([light, shadow], 0.5, {
            //     delay: 0.1,
            //     startX: canvas.width * 0.85,
            //     startY: canvas.height * 0.5,
            // }, "-= 0.5")
            .to([mainTitle, subtitleHome], 0.5, {
                opacity: 0,
                onComplete: () => {
                    if (mainTitle && subtitleHome) {
                        mainTitle.onTransition = false;
                        mainTitle.isMount = false;

                        subtitleHome.onTransition = false;
                        subtitleHome.isMount = false;
                    }
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
            mainTitle,
            subtitleHome,
        } = this.canvasComponents;

        const buttonPlay = this.components.buttonPlay.current as HTMLButtonElement;
        const levelInterface = this.components.levelInterface.current as HTMLElement;

        const isMobileDevise = window.innerWidth <= 768;

        this.levelToHome = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .to(curve, 0.5, {
                origin: curve.resizeOptions.home(canvas.width, canvas.height, isMobileDevise),
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
            .to([mainTitle, subtitleHome], 0.5, {
                opacity: 1,
                onStart: () => {
                    if (mainTitle && subtitleHome) {
                        mainTitle.onTransition = true;
                        subtitleHome.onTransition = true;
                    }
                },
                onComplete: () => {
                    if (mainTitle && subtitleHome) {
                        mainTitle.onTransition = false;
                        mainTitle.isMount = true;

                        subtitleHome.onTransition = false;
                        subtitleHome.isMount = true;
                    }
                },
            })
            .to(buttonPlay, 0.5, {
                opacity: 1,
            }, "-= 0.5");
    }

    public static initLevelToFaction(onComplete: () => void) {
        // const isMobileDevise = window.innerWidth <= 768;
        this.levelToFaction = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .add(curveCenter())
            .add([lightFaction(), shadowFaction(), levelInterfaceOut()], "-= 0.5")
            .add(factionInterfaceIn())
            .add(titleFactionIn(), "-= 0.5");
    }

    public static initFactionToLevel(onComplete: () => void) {
        const {
            canvas,
            curve,
            shadow,
            light,
            titleFaction,
        } = this.canvasComponents;

        const levelInterface = this.components.levelInterface.current as HTMLElement;
        const factionInterface = this.components.factionInterface.current as HTMLElement;

        const isMobileDevise = window.innerWidth <= 768;

        this.factionToLevel = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .to(curve, 0.5, {
                origin: curve.resizeOptions.level(canvas.width, canvas.height, isMobileDevise),
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
            .to(titleFaction, 0.5, {
                opacity: 0,
                onStart: () => {
                    titleFaction.onTransition = true;
                },
                onComplete: () => {
                    titleFaction.onTransition = false;
                    titleFaction.isMount = false;
                },
            }, "-= 0.5")
            .to(levelInterface, 0.5, {
                opacity: 1,
                onStart: () => {
                    levelInterface.style.display = "block";
                },
            });
    }

    public static initFactionToQueue(onComplete: () => void) {
        this.factionToQueueLight = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .add(curveQueue())
            .add([lightCenter(), shadowOut(), titleFactionOut(), factionInterfaceOut()], "-= 0.5")
            .add(queueInterfaceIn());

        this.factionToQueueShadow = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .add(curveQueue())
            .add([lightOut(), shadowCenter(), titleFactionOut(), factionInterfaceOut()], "-= 0.5")
            .add(queueInterfaceIn());
    }

    public static initQueueToFaction(onComplete: () => void) {
        // const isMobileDevise = window.innerWidth <= 768;

        this.queueToFaction = new TimelineLite({
            paused: true,
            onComplete: () => {
                onComplete();
            },
        })
            .add(curveCenter())
            .add([lightFaction(), shadowFaction(), queueInterfaceOut()], "-= 0.5")
            .add(factionInterfaceIn())
            .add(titleFactionIn(), "-= 0.5");
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

    public static playFactionToQueue(side: string) {
        this.setWaveInMoveMode();
        if (side === "light") {
            this.factionToQueueShadow.kill();
            this.factionToQueueLight.play(0);
        } else {
            this.factionToQueueLight.kill();
            this.factionToQueueShadow.play(0);
        }
    }

    public static playQueueToFaction() {
        this.setWaveInMoveMode();
        this.factionToQueueShadow.kill();
        this.factionToQueueLight.kill();
        this.queueToFaction.play(0);
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
        TweenLite.set(waveOptions, {
            randomRange: 300,
            amplitudeRange: 50,
            speed: 0.1,
        });
        this.mouseEnterButtonPlay.play();
    }

    public static setWaveInMoveMode() {
        TweenLite.set(waveOptions, {
            viscosity: 40,
            damping: 0.2,
            overwrite: "all",
        });
    }

    public static setWaveInDefaultMode() {
        TweenLite.set(waveOptions, {
            ...defaultWaveOptions,
        });
    }
}
