// vendors
import { gsap } from 'gsap';
import * as STATS from 'stats.js';
import React, { useEffect, useRef } from 'react';
// our libs
import { Levels, Side } from '@benjaminbours/composite-core';
import App from './App';
import { startLoadingAssets } from './assetsLoader';
import { geometries } from './levels/levels.utils';
import { SocketController } from '../SocketController';

interface Props {
    side: Side;
    selectedLevel: Levels;
    // can be undefined for dev purpose
    socketController?: SocketController;
}

function Game({ side, selectedLevel, socketController }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStarted = useRef(false);
    const appRef = useRef<App>();

    useEffect(() => {
        let gameLoop: (() => void) | undefined = undefined;
        startLoadingAssets(geometries).finally(() => {
            if (gameStarted.current) {
                return;
            }
            if (!canvasRef.current) {
                return;
            }
            if (!socketController) {
                return;
            }
            appRef.current = new App(
                canvasRef.current,
                selectedLevel,
                [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                socketController,
            );
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
                    appRef.current?.inputsManager.reset();
                    appRef.current?.clock.stop();
                } else {
                    appRef.current?.clock.start();
                }
            };

            document.addEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );

            gameLoop = () => {
                stats?.begin();
                if (appRef.current?.clock.running) {
                    appRef.current?.update();
                }
                appRef.current?.render();
                stats?.end();
            };
            // https://greensock.com/docs/v3/GSAP/gsap.ticker
            gsap.ticker.fps(30);
            gsap.ticker.add(gameLoop);
            gameStarted.current = true;

            return () => {
                if (gameLoop) {
                    gsap.ticker.remove(gameLoop);
                }
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
