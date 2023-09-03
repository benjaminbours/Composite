'use client';
import { gsap } from 'gsap';
import * as STATS from 'stats.js';
import React, { useEffect, useRef } from 'react';
import App from './App';
import { startLoadingAssets } from './assetsLoader';
import { geometries } from './levels/levels.utils';

function Game() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<App>();

    useEffect(() => {
        startLoadingAssets(geometries).finally(() => {
            if (!canvasRef.current) {
                return;
            }
            appRef.current = new App(canvasRef.current, ['white']);
            const stats = (() => {
                if (process.env.NEXT_PUBLIC_STAGE === 'development') {
                    const stats = new STATS.default();
                    stats.showPanel(1);
                    document.body.appendChild(stats.dom);
                    return stats;
                }
                return undefined;
            })();

            const gameLoop = () => {
                stats?.begin();
                appRef.current?.update();
                appRef.current?.render();
                stats?.end();
            };
            gsap.ticker.add(gameLoop);
        });
    }, []);

    return <canvas ref={canvasRef} id="game" style={{ zIndex: -4 }}></canvas>;
}

export default Game;
