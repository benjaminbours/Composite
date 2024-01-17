// vendors
import { useCallback } from 'react';
import { gsap } from 'gsap';
// project
import { MenuScene } from './types';
import Curve from './canvas/Curve';
import {
    TweenOptions,
    allMenuScenesOut,
    curveToStep,
    factionIn,
    homeIn,
    levelIn,
    lightToStep,
    queueIn,
    shadowToStep,
    RefHashMap,
} from './tweens';

export function useTweens(refHashMap: RefHashMap) {
    const goToStep = useCallback(
        (tweenOptions: TweenOptions, onComplete: () => void) => {
            const allRefsExist = Object.values(refHashMap).every(
                (ref) => ref && ref.current,
            );

            if (!allRefsExist) {
                return;
            }
            const inAnimation = () => {
                switch (tweenOptions.step) {
                    case MenuScene.HOME:
                        return homeIn(refHashMap.homeRef.current!);
                    case MenuScene.LEVEL:
                        return levelIn(refHashMap.levelRef.current!);
                    case MenuScene.FACTION:
                        return factionIn(refHashMap.sideRef.current!);
                    case MenuScene.QUEUE:
                        return queueIn(refHashMap.queueRef.current!);
                    default:
                        return homeIn(refHashMap.homeRef.current!);
                }
            };
            Curve.setWaveOptions({
                viscosity: 40,
                damping: 0.2,
            });
            gsap.timeline({
                onComplete: () => {
                    onComplete();
                },
            })
                .add(curveToStep(tweenOptions, refHashMap.canvasBlack.current!))
                .add(
                    [
                        lightToStep(
                            tweenOptions,
                            refHashMap.canvasBlack.current!,
                        ),
                        shadowToStep(
                            tweenOptions,
                            refHashMap.canvasWhite.current!,
                        ),
                        ...allMenuScenesOut(refHashMap),
                    ],
                    '-=0.5',
                )
                .add(inAnimation());
        },
        [],
    );

    return {
        goToStep,
    };
}
