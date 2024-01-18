// vendors
import { gsap } from 'gsap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// our libs
import { GameState, Side } from '@benjaminbours/composite-core';
import App from './App';
import { startLoadingAssets } from './assetsLoader';
import { SocketController } from '../SocketController';
import { MobileHUD } from './MobileHUD';
import InputsManager from './Player/InputsManager';
import { TeamMateDisconnectNotification } from '../TeamMateDisconnectNotification';

interface Props {
    side: Side;
    initialGameState: GameState;
    // can be undefined for dev purpose
    socketController?: SocketController;
    inputsManager: InputsManager;
    tabIsHidden: boolean;
    teamMateDisconnected: boolean;
    handleClickFindAnotherTeamMate: () => void;
    stats: React.MutableRefObject<Stats | undefined>;
}

function Game({
    side,
    socketController,
    initialGameState,
    tabIsHidden,
    stats,
    teamMateDisconnected,
    handleClickFindAnotherTeamMate,
    inputsManager,
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
        appRef.current?.render();
        stats.current?.end();
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (!appRef.current) {
                return;
            }
            appRef.current.resize();
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
                if (!socketController) {
                    return;
                }
                appRef.current = new App(
                    canvasRef.current,
                    initialGameState,
                    [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                    socketController,
                    inputsManager,
                );
                // https://greensock.com/docs/v3/GSAP/gsap.ticker
                gsap.ticker.fps(60);
                gsap.ticker.add(gameLoop);
                gameStarted.current = true;
                setIsSynchronizingTime(true);
            });
        }

        return () => {
            gsap.ticker.remove(gameLoop);
            appRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        if (!tabIsHidden && isSynchronizingTime && socketController) {
            const onTimeSynchronized = () => {
                appRef.current?.inputsManager.registerEventListeners();
                setIsSynchronizingTime(false);
            };

            if (process.env.NEXT_PUBLIC_SKIP_MATCHMAKING) {
                onTimeSynchronized();
            } else {
                socketController.synchronizeTime().then(onTimeSynchronized);
            }
        }

        return () => {
            appRef.current?.inputsManager.destroyEventListeners();
        };
    }, [isSynchronizingTime, tabIsHidden]);

    return (
        <>
            <TeamMateDisconnectNotification
                teamMateDisconnected={teamMateDisconnected}
                handleClickFindAnotherTeamMate={handleClickFindAnotherTeamMate}
            />
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
