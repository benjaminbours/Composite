'use client';
// vendors
import {
    useCallback,
    useContext,
    useState,
    createContext,
    useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
// local
import CanvasBlack from '../Menu/canvas/CanvasBlack';
import CanvasWhite from '../Menu/canvas/CanvasWhite';
import { MenuScene, Route } from '../types';
import {
    allMenuScenesOut,
    curveToStep,
    homeIn,
    teamLobbyIn,
    TweenOptions,
} from '../Menu/tweens';
import Curve, { defaultWaveOptions } from '../Menu/canvas/Curve';
import {
    sideElementToStep,
    moveSideElementToCoordinate,
} from '../utils/transition';
import { Side } from '@benjaminbours/composite-core';
import Mouse from '../Menu/canvas/Mouse';

export interface RefHashMap {
    canvasBlack: React.MutableRefObject<CanvasBlack | undefined>;
    canvasWhite: React.MutableRefObject<CanvasWhite | undefined>;
    homeRef: React.RefObject<HTMLDivElement>;
    endLevelRef: React.RefObject<HTMLDivElement>;
    lobbyRef: React.RefObject<HTMLDivElement>;
    notFoundRef: React.RefObject<HTMLDivElement>;
}

interface MenuTransitionContext {
    // properties
    menuScene: MenuScene;
    nextMenuScene: MenuScene | undefined;
    // actions
    setMenuScene: React.Dispatch<React.SetStateAction<MenuScene>>;
    moveAllGraphicsToElement: (bbox: DOMRect) => void;
    setCurveIsFast: (value: boolean) => void;
    setLightIsPulsingFast: (value: boolean) => void;
    setShadowRotationSpeed: (rotationSpeed: number) => void;
    goToHome: () => void;
    goToLobby: () => void;
    resize: () => void;
    startCanvasLoop: (
        stats: React.MutableRefObject<Stats | undefined>,
        canvasBlackDomElement: React.RefObject<HTMLCanvasElement>,
        canvasWhiteDomElement: React.RefObject<HTMLCanvasElement>,
    ) => () => void;
    menuOut: (onComplete: () => void) => void;
    menuIn: (onComplete: () => void) => void;
    handleSideButton: (
        side: Side,
        action: 'enter' | 'leave',
    ) => (e: React.MouseEvent) => void;
    // refs
    canvasBlack: React.MutableRefObject<CanvasBlack | undefined>;
    canvasWhite: React.MutableRefObject<CanvasWhite | undefined>;
    homeRef: React.RefObject<HTMLDivElement>;
    endLevelRef: React.RefObject<HTMLDivElement>;
    lobbyRef: React.RefObject<HTMLDivElement>;
    notFoundRef: React.RefObject<HTMLDivElement>;
    menuContainerRef: React.RefObject<HTMLDivElement>;
}

export const MenuTransitionContext = createContext<MenuTransitionContext>(
    {} as MenuTransitionContext,
);

export function useMenuTransition(initialScene: MenuScene = MenuScene.HOME) {
    const router = useRouter();
    const [menuScene, setMenuScene] = useState<MenuScene>(initialScene);
    const [nextMenuScene, setNextMenuScene] = useState<MenuScene | undefined>(
        undefined,
    );

    const menuContainerRef = useRef<HTMLDivElement>(null);
    const canvasBlack = useRef<CanvasBlack>();
    const canvasWhite = useRef<CanvasWhite>();
    const onTransition = useRef(false);
    const homeRef = useRef<HTMLDivElement>(null);
    const endLevelRef = useRef<HTMLDivElement>(null);
    const lobbyRef = useRef<HTMLDivElement>(null);
    const notFoundRef = useRef<HTMLDivElement>(null);

    const goToStep = useCallback(
        (tweenOptions: TweenOptions, onComplete?: () => void) => {
            if (!canvasBlack.current || !canvasWhite.current) {
                return;
            }

            const refHashMap = {
                canvasBlack,
                canvasWhite,
                homeRef,
                endLevelRef,
                lobbyRef,
                notFoundRef,
            };

            const isMobileDevice = window.innerWidth <= 768;
            const inAnimation = () => {
                switch (tweenOptions.step) {
                    case MenuScene.TEAM_LOBBY:
                        refHashMap.lobbyRef.current!.style.display = 'none';
                        return teamLobbyIn(refHashMap.lobbyRef.current!);
                    case MenuScene.HOME:
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
                canvasBlack.current.light,
                tweenOptions,
                isMobileDevice,
            );
            const shadowAnim = sideElementToStep(
                canvasWhite.current.shadow,
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
        [],
    );

    const goToHome = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        router.push(Route.HOME);
        goToStep({
            step: MenuScene.HOME,
            side: undefined,
        });
        // TODO: Check if router is not making this function rerender
    }, [goToStep, router]);

    const goToLobby = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        router.push(Route.LOBBY);
        goToStep({ step: MenuScene.TEAM_LOBBY }, () => {
            // TODO: I think this call is not necessary
            // setMenuScene(MenuScene.TEAM_LOBBY);
            // setState((prev) => ({
            //     ...prev,
            //     loadedLevel: undefined,
            //     mateDisconnected: false,
            //     you: {
            //         isReady: false,
            //         side: undefined,
            //         level: undefined,
            //         account: currentUser || undefined,
            //     },
            //     isInQueue: false,
            //     isWaitingForFriend: false,
            // }));
        });
    }, [goToStep, router]);

    const resize = useCallback(() => {
        if (!canvasBlack.current || !canvasWhite.current) {
            return;
        }
        const isMobileDevice = window.innerWidth <= 768;
        canvasBlack.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            // side: state.you.side,
        });
        canvasWhite.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            // side: state.you.side,
        });
    }, [menuScene]);

    const setCurveIsFast = useCallback((value: boolean) => {
        if (!canvasBlack.current) {
            return;
        }

        if (value) {
            canvasBlack.current.curve.mouseIsHoverButton = true;
            // TODO: refactor to avoid this kind of static method
            Curve.setWaveOptions({
                randomRange: 300,
                amplitudeRange: 50,
                speed: 0.1,
            });
        } else {
            canvasBlack.current.curve.mouseIsHoverButton = false;
            Curve.setWaveOptions({
                ...defaultWaveOptions,
            });
        }
    }, []);

    const setLightIsPulsingFast = useCallback((value: boolean) => {
        if (!canvasBlack.current) {
            return;
        }
        canvasBlack.current.light.isPulsingFast = value;
    }, []);

    const setShadowRotationSpeed = useCallback((rotationSpeed: number) => {
        if (!canvasWhite.current) {
            return;
        }
        gsap.to(canvasWhite.current.shadow, {
            duration: 1,
            rotationSpeed,
            ease: 'power3.easeOut',
        });
    }, []);

    const moveAllGraphicsToElement = useCallback((bbox: DOMRect) => {
        if (!canvasBlack.current || !canvasWhite.current) {
            return;
        }
        Curve.setWaveOptions({
            viscosity: 40,
            damping: 0.2,
        });
        gsap.to(canvasBlack.current.curve, {
            duration: 0.5,
            delay: 0.1,
            origin: bbox.x + bbox.width / 2,
            onComplete: () => {
                Curve.setWaveOptions({
                    ...defaultWaveOptions,
                });
            },
        });
        moveSideElementToCoordinate(
            canvasBlack.current.light,
            bbox.x + bbox.width / 2,
            bbox.y + bbox.height / 2,
        );
        moveSideElementToCoordinate(
            canvasWhite.current.shadow,
            bbox.x + bbox.width / 2,
            bbox.y + bbox.height / 2,
        );
    }, []);

    const startCanvasLoop = useCallback(
        (
            stats: React.MutableRefObject<Stats | undefined>,
            canvasBlackDomElement: React.RefObject<HTMLCanvasElement>,
            canvasWhiteDomElement: React.RefObject<HTMLCanvasElement>,
        ) => {
            canvasBlack.current = new CanvasBlack(
                canvasBlackDomElement.current!,
            );
            canvasWhite.current = new CanvasWhite(
                canvasWhiteDomElement.current!,
            );
            Mouse.init();
            resize();

            const canvasLoop = () => {
                stats.current?.begin();
                canvasBlack.current?.render();
                canvasWhite.current?.render();
                stats.current?.end();
            };
            gsap.ticker.fps(60);
            gsap.ticker.add(canvasLoop);

            const destroyCanvasLoop = () => {
                gsap.ticker.remove(canvasLoop);
                Mouse.destroy();
            };

            return destroyCanvasLoop;
        },
        [resize],
    );

    const menuOut = useCallback((onComplete: () => void) => {
        if (!menuContainerRef.current) {
            return;
        }
        gsap.fromTo(
            menuContainerRef.current,
            {
                maskImage:
                    'radial-gradient(circle closest-side, transparent -65%, rgba(0, 0, 0, 0.25) -30%, rgba(0, 0, 0, 1) 0%)',
            },
            {
                duration: 2,
                maskImage:
                    'radial-gradient(circle closest-side, transparent 200%, rgba(0, 0, 0, 0.25) 230%, rgba(0, 0, 0, 1) 265%)',
                onComplete,
            },
        );
    }, []);

    const menuIn = useCallback((onComplete: () => void) => {
        if (!menuContainerRef.current) {
            return;
        }

        gsap.fromTo(
            menuContainerRef.current,
            {
                maskImage:
                    'radial-gradient(circle closest-side, transparent 200%, rgba(0, 0, 0, 0.25) 230%, rgba(0, 0, 0, 1) 265%)',
            },
            {
                duration: 2,
                maskImage:
                    'radial-gradient(circle closest-side, transparent -65%, rgba(0, 0, 0, 0.25) -30%, rgba(0, 0, 0, 1) 0%)',
                onComplete,
            },
        );
    }, []);

    const handleSideButton = useCallback(
        (side: Side, action: 'enter' | 'leave') => (e: React.MouseEvent) => {
            const yingYang =
                e.currentTarget.parentElement?.querySelector('.ying-yang');
            if (!yingYang || !canvasBlack.current || !canvasWhite.current) {
                return;
            }

            const handleVisibility = (side: Side) => {
                const yang = yingYang.querySelector<SVGPathElement>('.black');
                const ying = yingYang.querySelector<SVGPathElement>('.white');
                if (side === Side.LIGHT && ying) {
                    ying.classList.toggle('visible');
                } else if (side === Side.SHADOW && yang) {
                    yang.classList.toggle('visible');
                }
            };

            const moveElementToCoordinate = (side: Side) => {
                if (side === Side.LIGHT) {
                    moveSideElementToCoordinate(
                        canvasBlack.current!.light,
                        0.25 * window.innerWidth,
                        0.75 * window.innerHeight,
                    );
                    setLightIsPulsingFast(true);
                } else {
                    moveSideElementToCoordinate(
                        canvasWhite.current!.shadow,
                        0.75 * window.innerWidth,
                        0.75 * window.innerHeight,
                    );
                    setShadowRotationSpeed(0.02);
                }
            };

            const resetElementState = (side: Side) => {
                if (side === Side.LIGHT) {
                    setLightIsPulsingFast(false);
                    sideElementToStep(
                        canvasBlack.current!.light,
                        {
                            step: MenuScene.TEAM_LOBBY,
                            // step:
                            //     state.you.side === side ||
                            //     state.mate?.side === side
                            //         ? MenuScene.TEAM_LOBBY_SELECTED
                            //         : MenuScene.TEAM_LOBBY,
                        },
                        false,
                    );
                } else {
                    setShadowRotationSpeed(0.005);
                    sideElementToStep(
                        canvasWhite.current!.shadow,
                        {
                            step: MenuScene.TEAM_LOBBY,
                            // step:
                            //     state.you.side === side ||
                            //     state.mate?.side === side
                            //         ? MenuScene.TEAM_LOBBY_SELECTED
                            //         : MenuScene.TEAM_LOBBY,
                        },
                        false,
                    );
                }
            };

            handleVisibility(side);
            if (action === 'enter') {
                moveElementToCoordinate(side);
            } else {
                resetElementState(side);
            }
        },
        [setShadowRotationSpeed, setLightIsPulsingFast],
    );

    return {
        // properties
        menuScene,
        nextMenuScene,
        // onTransition,

        // actions
        goToStep,
        setMenuScene,
        moveAllGraphicsToElement,
        resize,
        goToHome,
        goToLobby,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        setCurveIsFast,
        startCanvasLoop,
        menuOut,
        menuIn,
        handleSideButton,
        // refs
        canvasBlack,
        canvasWhite,
        homeRef,
        endLevelRef,
        lobbyRef,
        notFoundRef,
        menuContainerRef,
    };
}

interface MenuTransitionContextProviderProps {
    children: React.ReactNode;
    initialScene: MenuScene | undefined;
}

export const MenuTransitionContextProvider: React.FC<
    MenuTransitionContextProviderProps
> = ({ children, initialScene }) => {
    return (
        <MenuTransitionContext.Provider value={useMenuTransition(initialScene)}>
            {children}
        </MenuTransitionContext.Provider>
    );
};

export const useMenuTransitionContext = (): MenuTransitionContext =>
    useContext(MenuTransitionContext);
