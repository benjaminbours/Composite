'use client';
import { gsap } from 'gsap';
import * as STATS from 'stats.js';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import type Animation from './Animation';
import Interfaces from './components/dom';
import { Context } from './context';
import CanvasBlack from './components/canvas/CanvasBlack';
import CanvasWhite from './components/canvas/CanvasWhite';
import Mouse from './components/canvas/Mouse';
import { Side, Scene } from './types';

const stats = (() => {
    if (process.env.NEXT_PUBLIC_STAGE === 'development') {
        const stats = new STATS.default();
        stats.showPanel(1);
        document.body.appendChild(stats.dom);
        return stats;
    }
    return undefined;
})();

interface State {
    currentScene: Scene;
    side: Side;
}

export function Menu() {
    const [state, setState] = useState<State>({
        currentScene: 'home',
        side: 'black',
    });
    const blackCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const whiteCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const blackCanvas = useRef<CanvasBlack>();
    const whiteCanvas = useRef<CanvasWhite>();
    const onTransition = useRef(false);
    const animation = useRef<typeof Animation>();
    const homeRef = useRef<HTMLDivElement>(null);
    const levelRef = useRef<HTMLDivElement>(null);
    const sideRef = useRef<HTMLDivElement>(null);
    const queueRef = useRef<HTMLDivElement>(null);

    const isMobileDevice = useMemo(() => {
        if (!window) {
            return true;
        }
        return window.innerWidth <= 768;
    }, []);

    const initAnimations = useCallback((animation: typeof Animation) => {
        animation.initHomeToLevel(() => {
            onTransition.current = false;
            setState((prev) => ({
                ...prev,
                currentScene: 'level',
            }));
        });
        animation.initLevelToHome(() => {
            onTransition.current = false;
            setState((prev) => ({
                ...prev,
                currentScene: 'home',
            }));
        });
        animation.initLevelToFaction(() => {
            onTransition.current = false;
            setState((prev) => ({
                ...prev,
                currentScene: 'faction',
            }));
        });
        animation.initFactionToLevel(() => {
            onTransition.current = false;
            setState((prev) => ({
                ...prev,
                currentScene: 'level',
            }));
        });
    }, []);

    const resize = useCallback(() => {
        if (
            !animation.current ||
            !blackCanvas.current ||
            !whiteCanvas.current
        ) {
            return;
        }
        const isMobileDevice = window.innerWidth <= 768;
        blackCanvas.current.resize({
            isMobileDevice,
            currentScene: state.currentScene,
            side: state.side,
        });
        whiteCanvas.current.resize({
            isMobileDevice,
            currentScene: state.currentScene,
            side: state.side,
        });
        animation.current.runMethodForAllBothSideComponents('resize', [
            blackCanvas.current.ctx,
        ]);
        initAnimations(animation.current);
    }, [isMobileDevice, state.currentScene]);

    useEffect(() => {
        Promise.all([
            import('./Animation').then((mod) => mod.default),
            import('./crossBrowser'),
        ]).then(([Animation]) => {
            animation.current = Animation;
            blackCanvas.current = new CanvasBlack(
                blackCanvasDomElement.current as HTMLCanvasElement,
            );
            whiteCanvas.current = new CanvasWhite(
                whiteCanvasDomElement.current as HTMLCanvasElement,
            );
            Animation.initComponents(
                {
                    homeInterface: homeRef,
                    levelInterface: levelRef,
                    factionInterface: sideRef,
                    queueInterface: queueRef,
                },
                blackCanvas.current,
                whiteCanvas.current,
                state.currentScene,
                state.side,
                isMobileDevice,
            );
            initAnimations(Animation);
            Animation.runMethodForAllBothSideComponents('resize', [
                blackCanvas.current.ctx,
            ]);
            Mouse.init();
            const canvasLoop = () => {
                stats?.begin();
                blackCanvas.current!.render();
                whiteCanvas.current!.render();
                stats?.end();
            };
            gsap.ticker.add(canvasLoop);
            resize();
        });
    }, []);

    // on resize
    useEffect(() => {
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [initAnimations, resize]);

    const handleMouseEnterPlay = useCallback(() => {
        if (!animation.current) {
            return;
        }
        animation.current.playMouseEnterButtonPlay();
    }, []);

    const handleMouseLeavePlay = useCallback(() => {
        if (!animation.current) {
            return;
        }
        if (!onTransition.current) {
            animation.current.playMouseLeaveButtonPlay();
        }
    }, []);

    const handleClickOnPlay = useCallback(() => {
        if (!animation.current) {
            return;
        }
        onTransition.current = true;
        animation.current.playHomeToLevel();
    }, []);

    const handleClickOnBack = useCallback(() => {
        if (!animation.current) {
            return;
        }
        const backOptions = {
            level() {
                animation.current!.playLevelToHome();
            },
            faction() {
                animation.current!.playFactionToLevel();
            },
            queue() {
                animation.current!.playQueueToFaction();
            },
        };
        const { currentScene } = state;
        onTransition.current = true;
        if (currentScene === 'queue') {
            animation.current.initQueueToFaction(() => {
                onTransition.current = false;
                setState((prev) => ({
                    ...prev,
                    currentScene: 'faction',
                }));
            });
        }
        if (currentScene !== 'home') {
            backOptions[currentScene]();
        }
    }, [state]);

    const handleClickOnLevel = useCallback((name: string) => {
        if (!animation.current) {
            return;
        }
        onTransition.current = true;
        animation.current.playLevelToFaction();
    }, []);

    const handleClickOnFaction = useCallback((side: Side) => {
        if (!animation.current) {
            return;
        }
        setState((prev) => ({
            ...prev,
            faction: side,
        }));
        animation.current.initFactionToQueue(() => {
            onTransition.current = true;
            setState((prev) => ({
                ...prev,
                currentScene: 'queue',
            }));
        });
        animation.current.playFactionToQueue();
    }, []);

    return (
        <Context.Provider
            value={{
                ...state,
                handleClickOnBack,
                handleClickOnFaction,
                handleClickOnPlay,
                handleClickOnLevel,
                handleMouseEnterPlay,
                handleMouseLeavePlay,
            }}
        >
            <canvas
                id="white"
                style={{ zIndex: -3 }}
                ref={whiteCanvasDomElement}
            />
            <canvas
                id="black"
                style={{ zIndex: -2 }}
                ref={blackCanvasDomElement}
            />
            <Interfaces
                currentScene={state.currentScene}
                homeRef={homeRef}
                levelRef={levelRef}
                factionRef={sideRef}
                queueRef={queueRef}
            />
        </Context.Provider>
    );
}
