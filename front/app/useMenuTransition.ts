import { useRef, useMemo, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import CanvasBlack from './Menu/canvas/CanvasBlack';
import CanvasWhite from './Menu/canvas/CanvasWhite';
import {
    TweenOptions,
    allMenuScenesOut,
    curveToStep,
    homeIn,
    teamLobbyIn,
} from './Menu/tweens';
import Curve from './Menu/canvas/Curve';
import { MenuScene } from './types';
import { Side } from '@benjaminbours/composite-core';

export interface RefHashMap {
    canvasBlack: React.MutableRefObject<CanvasBlack | undefined>;
    canvasWhite: React.MutableRefObject<CanvasWhite | undefined>;
    homeRef: React.RefObject<HTMLDivElement>;
    endLevelRef: React.RefObject<HTMLDivElement>;
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
    const endLevelRef = useRef<HTMLDivElement>(null);
    const teamLobbyRef = useRef<HTMLDivElement>(null);
    const notFoundRef = useRef<HTMLDivElement>(null);

    const refHashMap = useMemo(
        () => ({
            canvasBlack: blackCanvas,
            canvasWhite: whiteCanvas,
            homeRef,

            endLevelRef,
            teamLobbyRef,
            notFoundRef,
        }),
        [],
    );

    /**
     * Move a graphic side element to coordinates
     */
    const moveSideElementToCoordinate = useCallback(
        (side: Side, x: number, y: number, width?: number) => {
            if (
                !refHashMap.canvasBlack.current ||
                !refHashMap.canvasWhite.current
            ) {
                return;
            }
            const element =
                side === Side.LIGHT
                    ? refHashMap.canvasBlack.current.light
                    : refHashMap.canvasWhite.current.shadow;
            return gsap.to(element, {
                duration: 0.5,
                delay: 0.1,
                startX: x,
                startY: y,
                ...(width ? { width } : {}),
            });
        },
        [refHashMap],
    );

    /**
     * Move a graphic side element to a specific step
     */
    const sideElementToStep = useCallback(
        (element: Side, options: TweenOptions, isMobileDevice: boolean) => {
            const canvasKey =
                element === Side.LIGHT ? 'canvasBlack' : 'canvasWhite';
            const canvas = refHashMap[canvasKey].current;
            if (canvas === undefined) {
                return;
            }

            const elementKey = element === Side.LIGHT ? 'light' : 'shadow';

            const { step, side } = options;
            const { coordinates, width } = (canvas as any)[
                elementKey
            ].getParamsForScene({
                scene: step,
                canvasWidth: canvas.ctx.canvas.width,
                canvasHeight: canvas.ctx.canvas.height,
                isMobile: isMobileDevice,
                faction: side,
            });
            return moveSideElementToCoordinate(
                element,
                coordinates.x,
                coordinates.y,
                width,
            );
        },
        [refHashMap, moveSideElementToCoordinate],
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
            const lightAnim = sideElementToStep(
                Side.LIGHT,
                tweenOptions,
                isMobileDevice,
            );
            const shadowAnim = sideElementToStep(
                Side.SHADOW,
                tweenOptions,
                isMobileDevice,
            );

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
        [refHashMap, sideElementToStep],
    );

    const setLightIsPulsingFast = useCallback(
        (value: boolean) => {
            if (!refHashMap.canvasBlack.current) {
                return;
            }
            refHashMap.canvasBlack.current.light.isPulsingFast = value;
        },
        [refHashMap.canvasBlack],
    );

    const setShadowRotationSpeed = useCallback(
        (rotationSpeed: number) => {
            if (!refHashMap.canvasWhite.current) {
                return;
            }
            gsap.to(refHashMap.canvasWhite.current.shadow, {
                duration: 1,
                rotationSpeed,
                ease: 'power3.easeOut',
            });
        },
        [refHashMap.canvasWhite],
    );
    return {
        goToStep,
        sideElementToStep,
        moveSideElementToCoordinate,
        refHashMap,
        onTransition,
        menuScene,
        setMenuScene,
        nextMenuScene,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
    };
}
