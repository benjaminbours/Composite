import { useRef, useMemo, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import CanvasBlack from './Menu/canvas/CanvasBlack';
import CanvasWhite from './Menu/canvas/CanvasWhite';
import {
    TweenOptions,
    allMenuScenesOut,
    curveToStep,
    factionIn,
    homeIn,
    inviteFriendIn,
    levelIn,
    queueIn,
    teamLobbyIn,
} from './Menu/tweens';
import Curve from './Menu/canvas/Curve';
import { MenuScene } from './types';

export interface RefHashMap {
    canvasBlack: React.MutableRefObject<CanvasBlack | undefined>;
    canvasWhite: React.MutableRefObject<CanvasWhite | undefined>;
    homeRef: React.RefObject<HTMLDivElement>;
    levelRef: React.RefObject<HTMLDivElement>;
    sideRef: React.RefObject<HTMLDivElement>;
    queueRef: React.RefObject<HTMLDivElement>;
    endLevelRef: React.RefObject<HTMLDivElement>;
    inviteFriendRef: React.RefObject<HTMLDivElement>;
    teamLobbyRef: React.RefObject<HTMLDivElement>;
    notFoundRef: React.RefObject<HTMLDivElement>;
}

export function useMenuTransition(initialScene: MenuScene = MenuScene.HOME) {
    const [menuScene, setMenuScene] = useState<MenuScene>(initialScene);
    const [nextMenuScene, setNextMenuScene] = useState<MenuScene | undefined>(
        undefined,
    );

    const blackCanvas = useRef<CanvasBlack>();
    const whiteCanvas = useRef<CanvasWhite>();
    const onTransition = useRef(false);
    const homeRef = useRef<HTMLDivElement>(null);
    const levelRef = useRef<HTMLDivElement>(null);
    const sideRef = useRef<HTMLDivElement>(null);
    const queueRef = useRef<HTMLDivElement>(null);
    const endLevelRef = useRef<HTMLDivElement>(null);
    const inviteFriendRef = useRef<HTMLDivElement>(null);
    const teamLobbyRef = useRef<HTMLDivElement>(null);
    const notFoundRef = useRef<HTMLDivElement>(null);

    const refHashMap = useMemo(
        () => ({
            canvasBlack: blackCanvas,
            canvasWhite: whiteCanvas,
            homeRef,
            levelRef,
            sideRef,
            queueRef,
            endLevelRef,
            inviteFriendRef,
            teamLobbyRef,
            notFoundRef,
        }),
        [],
    );

    const lightToStep = useCallback(
        (options: TweenOptions, isMobileDevice: boolean) => {
            if (refHashMap.canvasBlack.current === undefined) {
                return;
            }
            const { step, side } = options;
            const { coordinates, width } =
                refHashMap.canvasBlack.current.light.getParamsForScene({
                    scene: step,
                    canvasWidth:
                        refHashMap.canvasBlack.current.ctx.canvas.width,
                    canvasHeight:
                        refHashMap.canvasBlack.current.ctx.canvas.height,
                    isMobile: isMobileDevice,
                    faction: side,
                });

            return gsap.to(refHashMap.canvasBlack.current.light, {
                duration: 0.5,
                delay: 0.1,
                startX: coordinates.x,
                startY: coordinates.y,
                width,
            });
        },
        [refHashMap],
    );

    const shadowToStep = useCallback(
        (options: TweenOptions, isMobileDevice: boolean) => {
            if (refHashMap.canvasWhite.current === undefined) {
                return;
            }

            const { step, side } = options;
            const { coordinates, width } =
                refHashMap.canvasWhite.current.shadow.getParamsForScene({
                    scene: step,
                    canvasWidth:
                        refHashMap.canvasWhite.current.ctx.canvas.width,
                    canvasHeight:
                        refHashMap.canvasWhite.current.ctx.canvas.height,
                    isMobile: isMobileDevice,
                    faction: side,
                });
            return gsap.to(refHashMap.canvasWhite.current.shadow, {
                duration: 0.5,
                delay: 0.1,
                startX: coordinates.x,
                startY: coordinates.y,
                width,
            });
        },
        [refHashMap],
    );

    const goToStep = useCallback(
        (tweenOptions: TweenOptions, onComplete?: () => void) => {
            const allRefsExist = Object.values(refHashMap).every(
                (ref) => ref && ref.current,
            );

            if (!allRefsExist) {
                return;
            }
            const isMobileDevice = window.innerWidth <= 768;
            const inAnimation = () => {
                switch (tweenOptions.step) {
                    case MenuScene.HOME:
                        refHashMap.homeRef.current!.style.display = 'none';
                        return homeIn(refHashMap.homeRef.current!);
                    case MenuScene.LEVEL:
                        refHashMap.levelRef.current!.style.display = 'none';
                        return levelIn(refHashMap.levelRef.current!);
                    case MenuScene.FACTION:
                        refHashMap.sideRef.current!.style.display = 'none';
                        return factionIn(refHashMap.sideRef.current!);
                    case MenuScene.QUEUE:
                        refHashMap.queueRef.current!.style.display = 'none';
                        return queueIn(refHashMap.queueRef.current!);
                    case MenuScene.INVITE_FRIEND:
                        refHashMap.inviteFriendRef.current!.style.display =
                            'none';
                        return inviteFriendIn(
                            refHashMap.inviteFriendRef.current!,
                        );
                    case MenuScene.TEAM_LOBBY:
                        refHashMap.teamLobbyRef.current!.style.display = 'none';
                        return teamLobbyIn(refHashMap.teamLobbyRef.current!);
                    default:
                        refHashMap.homeRef.current!.style.display = 'none';
                        return homeIn(refHashMap.homeRef.current!);
                }
            };
            Curve.setWaveOptions({
                viscosity: 40,
                damping: 0.2,
            });

            setNextMenuScene(tweenOptions.step);
            onTransition.current = true;
            const lightAnim = lightToStep(tweenOptions, isMobileDevice);
            const shadowAnim = shadowToStep(tweenOptions, isMobileDevice);

            gsap.timeline({
                onComplete: () => {
                    onTransition.current = false;
                    setNextMenuScene(undefined);
                    setMenuScene(tweenOptions.step);
                    if (onComplete) {
                        onComplete();
                    }
                },
            })
                .add(
                    curveToStep(
                        tweenOptions,
                        refHashMap.canvasBlack.current!,
                        isMobileDevice,
                    ),
                )
                .add(
                    [
                        ...(lightAnim ? [lightAnim] : []),
                        ...(shadowAnim ? [shadowAnim] : []),
                        ...allMenuScenesOut(refHashMap),
                    ],
                    '-=0.5',
                )
                .add(inAnimation());
        },
        [refHashMap, lightToStep, shadowToStep],
    );

    return {
        goToStep,
        lightToStep,
        shadowToStep,
        refHashMap,
        onTransition,
        menuScene,
        setMenuScene,
        nextMenuScene,
    };
}
