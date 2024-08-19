// vendors
import React, { useEffect, useRef } from 'react';
// our libs
// local
import { EndLevelScene, HomeScene, LobbyScene, NotFoundScene } from './scenes';
import { getDictionary } from '../../getDictionary';
import { useMenuTransitionContext } from '../contexts/menuTransitionContext';
import { BottomRightInfo } from '../BottomRightInfo';

interface Props {
    stats: React.MutableRefObject<Stats | undefined>;
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export function Menu({ dictionary, stats }: Props) {
    const canvasBlackDomElement = useRef<HTMLCanvasElement>(null);
    const canvasWhiteDomElement = useRef<HTMLCanvasElement>(null);

    const { resize, startCanvasLoop, menuContainerRef } =
        useMenuTransitionContext();

    useEffect(
        () =>
            // startCanvasLoop return a cleanup function
            startCanvasLoop(
                stats,
                canvasBlackDomElement,
                canvasWhiteDomElement,
            ),
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    // on mount
    useEffect(() => {
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [resize]);

    return (
        <div className="menu" ref={menuContainerRef}>
            <canvas
                id="white"
                style={{ zIndex: -3, background: 'white' }}
                ref={canvasWhiteDomElement}
            />
            <canvas
                id="black"
                style={{ zIndex: -2 }}
                ref={canvasBlackDomElement}
            />
            {/* <NotFoundScene
                isMount={
                    menuScene === MenuScene.NOT_FOUND ||
                    nextMenuScene === MenuScene.NOT_FOUND
                }
                notFoundRef={refHashMap.notFoundRef}
                onHomeClick={handleClickHome}
            /> */}
            <HomeScene />
            <LobbyScene dictionary={dictionary} />
            <EndLevelScene dictionary={dictionary} />
            <BottomRightInfo />
        </div>
    );
}
