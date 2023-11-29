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
    curveToStep,
    lightToStep,
    shadowToStep,
    levelIn,
    factionIn,
    queueIn,
    homeIn,
    allMenuScenesOut,
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

    public static goToStep(targetStep: MenuScene, onComplete: () => void) {
        const inAnimation = (() => {
            switch (targetStep) {
                case MenuScene.HOME:
                    return homeIn;
                case MenuScene.LEVEL:
                    return levelIn;
                case MenuScene.FACTION:
                    return factionIn;
                case MenuScene.QUEUE:
                    return queueIn;
                default:
                    return homeIn;
            }
        })();
        this.setWaveInMoveMode();
        gsap.timeline({
            onComplete: () => {
                onComplete();
            },
        })
            .add(curveToStep(targetStep))
            .add(
                [
                    lightToStep(targetStep),
                    shadowToStep(targetStep),
                    ...allMenuScenesOut(),
                ],
                '-=0.5',
            )
            .add(inAnimation());
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
