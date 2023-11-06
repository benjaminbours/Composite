// vendors
import { gsap } from 'gsap';
import { RefObject } from 'react';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
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
import { MenuScene } from './types';
import Shadow from './canvas/Shadow';
import Light from './canvas/Light';
import MainTitle from './canvas/MainTitle';
import SubtitleHome from './canvas/SubtitleHome';

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
        currentScene: MenuScene,
        isMobileDevice: boolean,
    ) {
        this.isMobileDevice = isMobileDevice;
        this.components = domElements;
        this.canvasComponents = {
            curve: canvasBlack.curve,
            light: canvasBlack.light,
            shadow: canvasWhite.shadow,
            canvas: canvasWhite.ctx.canvas,
            mainTitle: new MainTitle(currentScene === MenuScene.HOME),
            subtitleHome: new SubtitleHome(
                'THINK BOTH WAYS',
                currentScene === MenuScene.HOME,
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
            .add([curveToStep(MenuScene.LEVEL), ...homeOut()])
            .add(
                [lightToStep(MenuScene.LEVEL), shadowToStep(MenuScene.LEVEL)],
                '-=0.5',
            )
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
            .add(curveToStep(MenuScene.HOME))
            .add(
                [
                    lightToStep(MenuScene.HOME),
                    shadowToStep(MenuScene.HOME),
                    levelOut(),
                ],
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
            .add(curveToStep(MenuScene.FACTION))
            .add(
                [
                    lightToStep(MenuScene.FACTION),
                    shadowToStep(MenuScene.FACTION),
                    levelOut(),
                ],
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
            .add(curveToStep(MenuScene.LEVEL))
            .add(
                [
                    lightToStep(MenuScene.LEVEL),
                    shadowToStep(MenuScene.LEVEL),
                    ...factionOut(),
                ],
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
            .add(curveToStep(MenuScene.QUEUE))
            .add(
                [
                    lightToStep(MenuScene.QUEUE),
                    shadowToStep(MenuScene.QUEUE),
                    ...factionOut(),
                ],
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
            .add(curveToStep(MenuScene.FACTION))
            .add(
                [
                    lightToStep(MenuScene.FACTION),
                    shadowToStep(MenuScene.FACTION),
                    queueOut(),
                ],
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
        Curve.setWaveOptions({
            viscosity: 40,
            damping: 0.2,
        });
    }

    public static setWaveInDefaultMode() {
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
    }
}
