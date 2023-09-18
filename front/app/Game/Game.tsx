// vendors
import { gsap } from 'gsap';
import * as STATS from 'stats.js';
import React, { useEffect, useRef } from 'react';
// our libs
import { Side } from 'composite-core';
import App from './App';
import { startLoadingAssets } from './assetsLoader';
import { geometries } from './levels/levels.utils';
import Inputs from './Player/Inputs';

function Game() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<App>();

    useEffect(() => {
        startLoadingAssets(geometries).finally(() => {
            if (!canvasRef.current) {
                return;
            }
            appRef.current = new App(canvasRef.current, [
                Side.LIGHT,
                Side.SHADOW,
            ]);
            // appRef.current = new App(canvasRef.current, ['black', 'white']);
            // appRef.current = new App(canvasRef.current, ['white']);
            const stats = (() => {
                if (process.env.NEXT_PUBLIC_STAGE === 'development') {
                    const stats = new STATS.default();
                    stats.showPanel(1);
                    document.body.appendChild(stats.dom);
                    return stats;
                }
                return undefined;
            })();

            const handleVisibilityChange = () => {
                if (document.visibilityState === 'hidden') {
                    Inputs.reset();
                    appRef.current?.clock.stop();
                } else {
                    appRef.current?.clock.start();
                }
            };

            document.addEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );

            const gameLoop = () => {
                stats?.begin();
                if (appRef.current?.clock.running) {
                    appRef.current?.update();
                }
                appRef.current?.render();
                stats?.end();
            };
            // https://greensock.com/docs/v3/GSAP/gsap.ticker
            // gsap.ticker.fps(90);
            gsap.ticker.add(gameLoop);

            return () => {
                document.removeEventListener(
                    'visibilitychange',
                    handleVisibilityChange,
                );
            };
        });
    }, []);

    return <canvas ref={canvasRef} id="game" style={{ zIndex: -4 }}></canvas>;
}

export default Game;
