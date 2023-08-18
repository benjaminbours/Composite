import { gsap } from 'gsap';
import React, { RefObject } from 'react';
import Curve, { defaultWaveOptions } from './canvas/Curve';
import CanvasBlack from './canvas/CanvasBlack';
import CanvasWhite from './canvas/CanvasWhite';
import {
    homeOut,
    curveToStep,
    lightToStep,
    shadowToStep,
    levelOut,
    levelIn,
    factionIn,
    factionOut,
    queueIn,
    queueOut,
    homeIn,
} from './tweens';
import { Scene, Side } from './types';
import Shadow from './canvas/Shadow';
import Light from './canvas/Light';
import MainTitle from './canvas/MainTitle';
import SubtitleHome from './canvas/SubtitleHome';
import TextDrawer from './canvas/TextDrawer';
import TitleFaction from './canvas/TitleFaction';

interface IAnimationComps {
    homeInterface: RefObject<HTMLDivElement>;
    levelInterface: RefObject<HTMLDivElement>;
    factionInterface: RefObject<HTMLDivElement>;
    queueInterface: RefObject<HTMLDivElement>;
}

interface AnimationCanvasComponents {
    canvas: HTMLCanvasElement;
    curve: Curve;
    shadow: Shadow;
    light: Light;
    mainTitle: MainTitle;
    subtitleHome: SubtitleHome;
    titleFaction: TextDrawer;
}
export default class Animation {
    public static homeToLevel: GSAPTimeline;
    public static levelToHome: GSAPTimeline;
    public static levelToFaction: GSAPTimeline;
    public static factionToLevel: GSAPTimeline;
    public static factionToQueue: GSAPTimeline;
    public static factionToQueueShadow: GSAPTimeline;
    public static factionToQueueLight: GSAPTimeline;
    public static queueToFaction: GSAPTimeline;

    public static components: IAnimationComps | undefined;
    public static canvasComponents: AnimationCanvasComponents;
    public static faction: Side;
    public static isMobileDevice: boolean;

    public static initComponents(
        domElements: IAnimationComps,
        canvasBlack: CanvasBlack,
        canvasWhite: CanvasWhite,
        currentScene: Scene,
        faction: Side,
        isMobileDevice: boolean,
    ) {
        this.faction = faction;
        this.isMobileDevice = isMobileDevice;
        this.components = domElements;
        this.canvasComponents = {
            curve: canvasBlack.curve,
            light: canvasBlack.light,
            shadow: canvasWhite.shadow,
            canvas: canvasWhite.ctx.canvas,
            mainTitle: new MainTitle(currentScene === 'home'),
            subtitleHome: new SubtitleHome(
                'THINK BOTH WAYS',
                currentScene === 'home',
            ),
            titleFaction: new TitleFaction(
                'SELECT A SIDE',
                currentScene === 'faction',
            ),
        };
    }

    public static initHomeToLevel(onComplete: () => void) {
        this.homeToLevel = gsap
            .timeline({
                paused: true,
                onComplete: () => {
                    this.playMouseLeaveButtonPlay();
                    onComplete();
                },
            })
            .add([curveToStep('level'), ...homeOut()])
            .add([lightToStep('level'), shadowToStep('level')], '-=0.5')
            .add(levelIn());
    }

    public static initLevelToHome(onComplete: () => void) {
        this.levelToHome = gsap
            .timeline({
                paused: true,
                onComplete: () => {
                    onComplete();
                },
            })
            .add(curveToStep('home'))
            .add(
                [lightToStep('home'), shadowToStep('home'), levelOut()],
                '-=0.5',
            )
            .add(homeIn());
    }

    public static initLevelToFaction(onComplete: () => void) {
        this.levelToFaction = gsap
            .timeline({
                paused: true,
                onComplete: () => {
                    onComplete();
                },
            })
            .add(curveToStep('faction'))
            .add(
                [lightToStep('faction'), shadowToStep('faction'), levelOut()],
                '-=0.5',
            )
            .add(factionIn());
    }

    public static initFactionToLevel(onComplete: () => void) {
        this.factionToLevel = gsap
            .timeline({
                paused: true,
                onComplete: () => {
                    onComplete();
                },
            })
            .add(curveToStep('level'))
            .add(
                [lightToStep('level'), shadowToStep('level'), ...factionOut()],
                '-=0.5',
            )
            .add(levelIn());
    }

    public static initFactionToQueue(onComplete: () => void) {
        this.factionToQueue = gsap
            .timeline({
                paused: true,
                onComplete: () => {
                    onComplete();
                },
            })
            .add(curveToStep('queue'))
            .add(
                [lightToStep('queue'), shadowToStep('queue'), ...factionOut()],
                '-=0.5',
            )
            .add(queueIn());
    }

    public static initQueueToFaction(onComplete: () => void) {
        this.queueToFaction = gsap
            .timeline({
                paused: true,
                onComplete: () => {
                    onComplete();
                },
            })
            .add(curveToStep('faction'))
            .add(
                [lightToStep('faction'), shadowToStep('faction'), queueOut()],
                '-=0.5',
            )
            .add(factionIn());
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

    public static playQueueToFaction() {
        this.setWaveInMoveMode();
        this.queueToFaction.play(0);
    }

    public static playMouseLeaveButtonPlay() {
        const { curve, light, shadow } = this.canvasComponents;

        // curve
        curve.mouseIsHoverButton = false;
        this.setWaveInDefaultMode();
        // light
        light.isPulsingFast = false;
        // shadow
        gsap.to(shadow, {
            duration: 1,
            rotationSpeed: 0.005,
            ease: 'power3.easeOut',
        });
    }

    public static playMouseEnterButtonPlay() {
        const { curve, light, shadow } = this.canvasComponents;

        // curve
        curve.mouseIsHoverButton = true;
        Curve.setWaveOptions({
            randomRange: 300,
            amplitudeRange: 50,
            speed: 0.1,
        });
        // light
        light.isPulsingFast = true;
        // shadow
        gsap.to(shadow, {
            duration: 1,
            rotationSpeed: 0.02,
            ease: 'power3.easeOut',
        });
    }

    public static setWaveInMoveMode() {
        // const { curve } = this.canvasComponents;
        // TweenLite.set(waveOptions, {
        //   viscosity: 40,
        //   damping: 0.2,
        //   overwrite: "all",
        // });
        Curve.setWaveOptions({
            viscosity: 40,
            damping: 0.2,
        });
    }

    public static setWaveInDefaultMode() {
        // const { curve } = this.canvasComponents;
        // TweenLite.set(waveOptions, {
        //   ...defaultWaveOptions,
        // });
        Curve.setWaveOptions({
            ...defaultWaveOptions,
        });
    }

    public static runMethodForAllBothSideComponents(
        property: string,
        params: any[],
    ) {
        Object.values(this.canvasComponents)
            .filter((component) => component.isBothSide)
            .forEach((component) => {
                if (component.hasOwnProperty(property)) {
                    if (property === 'render') {
                        if (component.isMount || component.onTransition) {
                            component[property](...params);
                        }
                    } else {
                        component[property](...params);
                    }
                }
            });
        // for (const sceneName in bothSideComponents) {
        //     if (bothSideComponents[sceneName]) {
        //         const scene = bothSideComponents[sceneName];
        //         for (const comp in scene) {
        //         }
        //     }
        // }
    }
}
