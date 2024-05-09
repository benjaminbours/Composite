// vendors
import { gsap } from 'gsap';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
// our libs
// local
import CanvasBlack from './canvas/CanvasBlack';
import CanvasWhite from './canvas/CanvasWhite';
import Mouse from './canvas/Mouse';
import { MenuScene } from '../types';
import {
    EndLevelScene,
    HomeScene,
    TeamLobbyScene,
    NotFoundScene,
} from './scenes';
import { getDictionary } from '../../getDictionary';
import { MainControllerContext } from '../MainApp';

interface Props {
    stats: React.MutableRefObject<Stats | undefined>;
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export function Menu({ dictionary, stats }: Props) {
    const blackCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const whiteCanvasDomElement = useRef<HTMLCanvasElement>(null);

    const {
        state,
        refHashMap,
        menuScene,
        nextMenuScene,
        handleClickHome,
        handleClickPlay,
        exitLobby,
        handleClickPlayAgain,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
    } = useContext(MainControllerContext);

    const resize = useCallback(() => {
        if (
            !refHashMap.canvasBlack.current ||
            !refHashMap.canvasWhite.current
        ) {
            return;
        }
        const isMobileDevice = window.innerWidth <= 768;
        refHashMap.canvasBlack.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            side: state.you.side,
        });
        refHashMap.canvasWhite.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            side: state.you.side,
        });
    }, [menuScene, state.you.side, refHashMap]);

    const canvasLoop = useCallback(() => {
        stats.current?.begin();
        refHashMap.canvasBlack.current?.render();
        refHashMap.canvasWhite.current?.render();
        stats.current?.end();
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // effect to start to render the menu animation
    useEffect(() => {
        refHashMap.canvasBlack.current = new CanvasBlack(
            blackCanvasDomElement.current as HTMLCanvasElement,
        );
        refHashMap.canvasWhite.current = new CanvasWhite(
            whiteCanvasDomElement.current as HTMLCanvasElement,
        );
        Mouse.init();
        resize();
        gsap.ticker.add(canvasLoop);
        return () => {
            gsap.ticker.remove(canvasLoop);
            Mouse.destroy();
        };
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // on mount
    useEffect(() => {
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [resize]);

    // const setSideSize = useCallback(
    //     (side: Side, size: number) => {
    //         if (side === Side.LIGHT) {
    //             if (!refHashMap.canvasBlack.current) {
    //                 return;
    //             }
    //             gsap.to(refHashMap.canvasBlack.current.light, {
    //                 duration: 1,
    //                 width: size,
    //                 ease: 'power3.easeOut',
    //             });
    //         } else {
    //             if (!refHashMap.canvasWhite.current) {
    //                 return;
    //             }
    //             gsap.to(refHashMap.canvasWhite.current.shadow, {
    //                 duration: 1,
    //                 width: size,
    //                 ease: 'power3.easeOut',
    //             });
    //         }
    //     },
    //     [refHashMap.canvasWhite, refHashMap.canvasBlack],
    // );

    return (
        <>
            <canvas
                id="white"
                style={{ zIndex: -3, background: 'white' }}
                ref={whiteCanvasDomElement}
            />
            <canvas
                id="black"
                style={{ zIndex: -2 }}
                ref={blackCanvasDomElement}
            />
            <NotFoundScene
                isMount={
                    menuScene === MenuScene.NOT_FOUND ||
                    nextMenuScene === MenuScene.NOT_FOUND
                }
                notFoundRef={refHashMap.notFoundRef}
                onHomeClick={handleClickHome}
            />
            <HomeScene
                homeRef={refHashMap.homeRef}
                refHashMap={refHashMap}
                handleClickPlay={handleClickPlay}
                isMount={
                    menuScene === MenuScene.HOME ||
                    nextMenuScene === MenuScene.HOME
                }
                setLightIsPulsingFast={setLightIsPulsingFast}
                setShadowRotationSpeed={setShadowRotationSpeed}
            />
            <TeamLobbyScene
                dictionary={dictionary}
                isMount={
                    menuScene === MenuScene.TEAM_LOBBY ||
                    nextMenuScene === MenuScene.TEAM_LOBBY
                }
            />
            <EndLevelScene
                isMount={
                    menuScene === MenuScene.END_LEVEL ||
                    nextMenuScene === MenuScene.END_LEVEL
                }
                endLevelRef={refHashMap.endLevelRef}
                side={state.you.side}
                level={state.loadedLevel}
                mate={state.mate}
                handleClickOnPlay={handleClickPlayAgain}
                handleClickOnExit={exitLobby}
                setLightIsPulsingFast={setLightIsPulsingFast}
                setShadowRotationSpeed={setShadowRotationSpeed}
            />
        </>
    );
}
