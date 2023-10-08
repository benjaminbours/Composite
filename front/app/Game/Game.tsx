// vendors
import { gsap } from 'gsap';
import * as STATS from 'stats.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// our libs
import { GameState, Side } from '@benjaminbours/composite-core';
import App from './App';
import { startLoadingAssets } from './assetsLoader';
import { SocketController } from '../SocketController';

interface Props {
    side: Side;
    initialGameState: GameState;
    // can be undefined for dev purpose
    socketController?: SocketController;
    tabIsHidden: boolean;
}

function Game({
    side,
    socketController,
    initialGameState,
    tabIsHidden,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStarted = useRef(false);
    const appRef = useRef<App>();
    const [isSynchronizingTime, setIsSynchronizingTime] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const handleGameFinished = useCallback(() => {
        setIsFinished(true);
    }, []);

    useEffect(() => {
        let gameLoop: (() => void) | undefined = undefined;
        startLoadingAssets().finally(() => {
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
                initialGameState,
                [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                socketController,
            );
            socketController.onGameFinished = handleGameFinished;
            const stats = (() => {
                if (process.env.NEXT_PUBLIC_STAGE === 'development') {
                    const stats = new STATS.default();
                    stats.showPanel(1);
                    document.body.appendChild(stats.dom);
                    return stats;
                }
                return undefined;
            })();

            // const handleVisibilityChange = () => {
            //     console.log(
            //         'visibilitychange game time',
            //         appRef.current?.currentState.game_time,
            //     );
            //     setIsSynchronizingTime(true);
            //     if (document.visibilityState === 'hidden') {
            //         console.log('visibilitychange hidden');
            //         appRef.current?.inputsManager.reset();
            //         appRef.current?.clock.stop();
            //     } else {
            //         console.log('visibilitychange seen');
            //         appRef.current?.clock.start();
            //     }
            // };

            // document.addEventListener(
            //     'visibilitychange',
            //     handleVisibilityChange,
            // );

            gameLoop = () => {
                stats?.begin();
                if (appRef.current?.clock.running) {
                    appRef.current?.run();
                }
                appRef.current?.render();
                stats?.end();
            };
            // https://greensock.com/docs/v3/GSAP/gsap.ticker
            gsap.ticker.fps(60);
            gsap.ticker.add(gameLoop);
            gameStarted.current = true;
            setIsSynchronizingTime(true);

            return () => {
                if (gameLoop) {
                    gsap.ticker.remove(gameLoop);
                }
                // document.removeEventListener(
                //     'visibilitychange',
                //     handleVisibilityChange,
                // );
            };
        });
    }, []);

    useEffect(() => {
        if (!tabIsHidden && isSynchronizingTime && socketController) {
            socketController.synchronizeTime().then(() => {
                appRef.current?.inputsManager.registerEventListeners();
                setIsSynchronizingTime(false);
            });
        }
    }, [isSynchronizingTime, tabIsHidden]);

    return (
        <>
            {isSynchronizingTime && (
                <div className="game-sync-overlay">is Synchronizing</div>
            )}
            {isFinished && (
                <div className="game-sync-overlay">Well done you dit it</div>
            )}
            <canvas ref={canvasRef} id="game" style={{ zIndex: -4 }}></canvas>
        </>
    );
}

export default Game;
