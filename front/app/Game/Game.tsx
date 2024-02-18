// vendors
import { gsap } from 'gsap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// our libs
import { GameState, Side } from '@benjaminbours/composite-core';
import App, { AppMode } from './App';
import { startLoadingAssets } from './assetsLoader';
import { SocketController } from '../SocketController';
import { MobileHUD } from './MobileHUD';
import InputsManager from './Player/InputsManager';

interface Props {
    side: Side;
    initialGameState: GameState;
    socketController?: SocketController;
    inputsManager: InputsManager;
    tabIsHidden: boolean;
    stats: React.MutableRefObject<Stats | undefined>;
    levelBuilderAppRef?: React.MutableRefObject<App | undefined>;
    // TODO: Don't like so much the management of this callback
    onTransformControlsObjectChange?: (object: THREE.Object3D) => void;
}

function Game({
    side,
    socketController,
    initialGameState,
    tabIsHidden,
    stats,
    inputsManager,
    levelBuilderAppRef,
    onTransformControlsObjectChange,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStarted = useRef(false);
    const appRef = useRef<App>();
    const [isSynchronizingTime, setIsSynchronizingTime] = useState(false);

    const isMobile = window.innerWidth <= 768;

    const gameLoop = useCallback(() => {
        stats.current?.begin();
        if (appRef.current?.clock.running) {
            appRef.current?.run();
        }
        appRef.current?.rendererManager.render(
            appRef.current?.gameStateManager.displayState,
            appRef.current?.delta,
        );
        stats.current?.end();
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (!appRef.current) {
                return;
            }
            appRef.current.rendererManager.resize();
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    useEffect(() => {
        if (!appRef.current) {
            startLoadingAssets().finally(() => {
                if (gameStarted.current) {
                    return;
                }
                if (!canvasRef.current) {
                    return;
                }
                const mode = levelBuilderAppRef ? AppMode.EDITOR : AppMode.GAME;
                appRef.current = new App(
                    canvasRef.current,
                    initialGameState,
                    [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                    inputsManager,
                    mode,
                    socketController,
                    onTransformControlsObjectChange,
                );
                if (levelBuilderAppRef) {
                    levelBuilderAppRef.current = appRef.current;
                }
                // https://greensock.com/docs/v3/GSAP/gsap.ticker
                gsap.ticker.fps(60);
                gsap.ticker.add(gameLoop);
                gameStarted.current = true;
                if (socketController) {
                    setIsSynchronizingTime(true);
                }
            });
        }

        return () => {
            gsap.ticker.remove(gameLoop);
            appRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        if (!tabIsHidden && isSynchronizingTime && socketController) {
            const onTimeSynchronized = ([serverTime, rtt]: [
                serverTime: number,
                rtt: number,
            ]) => {
                appRef.current?.gameStateManager.onAverageRttReceived(
                    serverTime,
                    rtt,
                );
                appRef.current?.inputsManager.registerEventListeners();
                setIsSynchronizingTime(false);
            };

            if (process.env.NEXT_PUBLIC_SOLO_MODE) {
                // TODO: Fix solo mode
                // onTimeSynchronized();
            } else {
                setIsSynchronizingTime(true);
                socketController.synchronizeTime().then(onTimeSynchronized);
            }
        }

        return () => {
            appRef.current?.inputsManager.destroyEventListeners();
        };
    }, [tabIsHidden, socketController, isSynchronizingTime]);

    return (
        <>
            {isSynchronizingTime && (
                <div className="game-sync-overlay">is Synchronizing</div>
            )}
            {isMobile && appRef.current && (
                <MobileHUD inputsManager={appRef.current.inputsManager} />
            )}
            <canvas ref={canvasRef} id="game" style={{ zIndex: -4 }}></canvas>
        </>
    );
}

export default Game;
