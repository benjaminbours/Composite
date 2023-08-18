'use client';
import { gsap } from 'gsap';
import * as STATS from 'stats.js';
import React, { useEffect, useRef } from 'react';
import App from './App';
import { startLoading } from './assetsLoader';

const stats = (() => {
    if (process.env.NEXT_PUBLIC_STAGE === 'development') {
        const stats = new STATS.default();
        stats.showPanel(1);
        document.body.appendChild(stats.dom);
        return stats;
    }
    return undefined;
})();

function Game() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<App>();

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        appRef.current = new App(canvasRef.current);
        const gameLoop = () => {
            stats?.begin();
            appRef.current?.render();
            stats?.end();
        };
        gsap.ticker.add(gameLoop);
        gameLoop();
    }, []);

    return <canvas ref={canvasRef} id="game" style={{ zIndex: -4 }}></canvas>;
}

export default Game;
