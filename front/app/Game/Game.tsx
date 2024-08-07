'use client';
// vendors
import { gsap } from 'gsap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    computeBoundsTree,
    disposeBoundsTree,
    acceleratedRaycast,
} from 'three-mesh-bvh/build/index.module.js';
import { BufferGeometry, Mesh, Object3D } from 'three';
// addExtensionFunctions
(BufferGeometry.prototype as any).computeBoundsTree = computeBoundsTree;
(BufferGeometry.prototype as any).disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;
// our libs
import {
    GameFinishedPayload,
    GameState,
    MovableComponentState,
    Side,
} from '@benjaminbours/composite-core';
import App, { AppMode } from './App';
import { SocketController } from '../SocketController';
import { MobileHUD } from './MobileHUD';
import InputsManager from './Player/InputsManager';
import { Level } from '@benjaminbours/composite-api-client';
import { CircularProgress, Divider } from '@mui/material';
import { DiscordButton } from '../02_molecules/DiscordButton';
import { DesktopHUD } from './DesktopHUD';
import { LobbyMode } from '../useMainController';

interface LevelEditorProps {
    // use do save the app instance somewhere else
    onAppLoaded: (app: App) => void;
    // TODO: Don't like so much the management of this callback
    onTransformControlsObjectChange: (object: Object3D) => void;
}

interface GameProps {
    initialGameState: GameState;
    level: Level;
    socketController?: SocketController;
    mode: LobbyMode;
    onPracticeGameFinished?: (data: GameFinishedPayload) => void;
}

interface Props {
    side: Side;
    onExitGame?: () => void;
    inputsManager: InputsManager;
    tabIsHidden: boolean;
    stats: React.MutableRefObject<Stats | undefined>;
    gameProps?: GameProps;
    levelEditorProps?: LevelEditorProps;
}

function Game({
    onExitGame,
    side,
    tabIsHidden,
    stats,
    inputsManager,
    gameProps,
    levelEditorProps,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasMiniMapRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<App>();
    const [isSynchronizingTime, setIsSynchronizingTime] = useState(false);
    const [isMobileInteractButtonAdded, setIsMobileInteractButtonAdded] =
        useState(false);

    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 500;

    const handleAddMobileInteractButton = useCallback(() => {
        setIsMobileInteractButtonAdded(true);
    }, []);

    const handleRemoveMobileInteractButton = useCallback(() => {
        setIsMobileInteractButtonAdded(false);
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
        const gameLoop = () => {
            stats.current?.begin();
            if (appRef.current?.clock.running) {
                appRef.current?.run();
            }
            appRef.current?.rendererManager.render(
                appRef.current?.gameStateManager.displayState,
                appRef.current?.delta,
            );
            if (appRef.current?.shouldCaptureSnapshot) {
                appRef.current?.captureSnapshot();
            }
            stats.current?.end();
        };
        // TODO: game loop should probably be in app, we use mainly app function inside
        const cleanUp = () => {
            if (appRef.current) {
                gsap.ticker.remove(gameLoop);
                appRef.current?.destroy();
                appRef.current = undefined;
            }
        };

        if (!canvasRef.current || !canvasMiniMapRef.current) {
            return;
        }

        if (gameProps) {
            appRef.current = new App(
                canvasRef.current,
                canvasMiniMapRef.current,
                gameProps.initialGameState,
                [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                inputsManager,
                AppMode.GAME,
                gameProps.level,
                gameProps.socketController,
                undefined,
                gameProps.mode === LobbyMode.PRACTICE
                    ? gameProps.onPracticeGameFinished
                    : undefined,
            );
            if (
                gameProps.mode === LobbyMode.SOLO ||
                gameProps.mode === LobbyMode.PRACTICE
            ) {
                appRef.current.registerSoloModeListeners();
            }
            if (isMobile) {
                appRef.current.onAddMobileInteractButton =
                    handleAddMobileInteractButton;
                appRef.current.onRemoveMobileInteractButton =
                    handleRemoveMobileInteractButton;
            }
            if (gameProps.mode !== LobbyMode.PRACTICE) {
                setIsSynchronizingTime(true);
            } else {
                appRef.current?.startRun();
            }
        } else if (levelEditorProps) {
            const initialGameState = new GameState(
                [
                    {
                        position: {
                            x: 200,
                            // TODO: Try better solution than putting the player position below the ground
                            y: 20,
                        },
                        velocity: {
                            x: 0,
                            y: 0,
                        },
                        state: MovableComponentState.inAir,
                        insideElementID: undefined,
                    },
                    {
                        position: {
                            x: 10,
                            y: 20,
                        },
                        velocity: {
                            x: 0,
                            y: 0,
                        },
                        state: MovableComponentState.inAir,
                        insideElementID: undefined,
                    },
                ],
                { id: 0, doors: {}, bounces: {}, end_level: [] },
                Date.now(),
                0,
            );
            appRef.current = new App(
                canvasRef.current,
                canvasMiniMapRef.current,
                initialGameState,
                [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                inputsManager,
                AppMode.EDITOR,
                undefined,
                undefined,
                levelEditorProps.onTransformControlsObjectChange,
            );
            levelEditorProps.onAppLoaded(appRef.current);
        }
        // https://greensock.com/docs/v3/GSAP/gsap.ticker

        gsap.ticker.fps(60);
        gsap.ticker.add(gameLoop);

        return () => {
            cleanUp();
        };
    }, []);

    useEffect(() => {
        if (!tabIsHidden && isSynchronizingTime && gameProps) {
            const onTimeSynchronized = ([serverTime, rtt]: [
                serverTime: number,
                rtt: number,
            ]) => {
                appRef.current?.gameStateManager.onAverageRttReceived(
                    serverTime,
                    rtt,
                );
            };

            const onStartTimer = () => {
                appRef.current?.inputsManager.registerEventListeners();
                setIsSynchronizingTime(false);
                appRef.current?.startRun();
            };

            setIsSynchronizingTime(true);
            gameProps.socketController
                ?.synchronizeTime(onStartTimer)
                .then(onTimeSynchronized);
        }

        return () => {
            appRef.current?.inputsManager.destroyEventListeners();
        };
    }, [tabIsHidden, gameProps, isSynchronizingTime]);

    return (
        <>
            {isSynchronizingTime && (
                <div className="game-sync-overlay">
                    <h3 className="title-h3">Synchronizing</h3>
                    <CircularProgress className="game-sync-overlay__progress" />
                    <div>
                        <div className="game-sync-overlay__tips">
                            <h4 className="title-h4">Tips</h4>
                            <p>
                                {`The minimap at the bottom right provides information about
                        your teammate's position.`}
                            </p>
                            <Divider />
                            <p>{`Any door can be open.`}</p>
                            <Divider />
                            {!isMobile && (
                                <>
                                    <p>
                                        {`It's funnier if you can speak by voice with your teammate.`}
                                    </p>
                                    <DiscordButton className="composite-button" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isMobile && gameProps && (
                <MobileHUD
                    appRef={appRef}
                    isMobileInteractButtonAdded={isMobileInteractButtonAdded}
                    inputsManager={inputsManager}
                    withSwitchPlayer={
                        gameProps.mode === LobbyMode.SOLO ||
                        gameProps.mode === LobbyMode.PRACTICE
                    }
                    onExitGame={onExitGame}
                />
            )}
            {!isMobile && gameProps && onExitGame && (
                <DesktopHUD
                    appRef={appRef}
                    onExitGame={onExitGame}
                    withActionsContainer={
                        gameProps.mode === LobbyMode.SOLO ||
                        gameProps.mode === LobbyMode.PRACTICE
                    }
                />
            )}
            <canvas ref={canvasRef} id="game" style={{ zIndex: -4 }} />
            <canvas
                ref={canvasMiniMapRef}
                id="minimap"
                style={{ zIndex: -3 }}
            />
        </>
    );
}

export default Game;
