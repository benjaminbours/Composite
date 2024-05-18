'use client';
// vendors
import { gsap } from 'gsap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    computeBoundsTree,
    disposeBoundsTree,
    acceleratedRaycast,
} from 'three-mesh-bvh/build/index.module.js';
import { BufferGeometry, Mesh } from 'three';
// addExtensionFunctions
(BufferGeometry.prototype as any).computeBoundsTree = computeBoundsTree;
(BufferGeometry.prototype as any).disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;
// our libs
import {
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

interface LevelEditorProps {
    // use do save the app instance somewhere else
    onAppLoaded: (app: App) => void;
    // TODO: Don't like so much the management of this callback
    onTransformControlsObjectChange: (object: THREE.Object3D) => void;
}

interface SoloGameProps {
    initialGameState: GameState;
    level: Level;
    onGameFinished: () => void;
}

interface MultiplayerGameProps {
    initialGameState: GameState;
    socketController?: SocketController;
    level: Level;
}

interface Props {
    side: Side;
    onExitGame?: () => void;
    inputsManager: InputsManager;
    tabIsHidden: boolean;
    stats: React.MutableRefObject<Stats | undefined>;
    soloGameProps?: SoloGameProps;
    multiplayerGameProps?: MultiplayerGameProps;
    levelEditorProps?: LevelEditorProps;
}

function Game({
    onExitGame,
    side,
    tabIsHidden,
    stats,
    inputsManager,
    multiplayerGameProps,
    levelEditorProps,
    soloGameProps,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasMiniMapRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<App>();
    const [isSynchronizingTime, setIsSynchronizingTime] = useState(false);
    const [isMobileInteractButtonAdded, setIsMobileInteractButtonAdded] =
        useState(false);

    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 500;

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

    const handleAddMobileInteractButton = useCallback(() => {
        setIsMobileInteractButtonAdded(true);
    }, []);

    const handleRemoveMobileInteractButton = useCallback(() => {
        setIsMobileInteractButtonAdded(false);
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

        if (multiplayerGameProps) {
            appRef.current = new App(
                canvasRef.current,
                canvasMiniMapRef.current,
                multiplayerGameProps.initialGameState,
                [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                inputsManager,
                AppMode.GAME,
                multiplayerGameProps.level,
                multiplayerGameProps.socketController,
            );
            if (isMobile) {
                appRef.current.onAddMobileInteractButton =
                    handleAddMobileInteractButton;
                appRef.current.onRemoveMobileInteractButton =
                    handleRemoveMobileInteractButton;
            }
            setIsSynchronizingTime(true);
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
        } else if (soloGameProps) {
            appRef.current = new App(
                canvasRef.current,
                canvasMiniMapRef.current,
                soloGameProps.initialGameState,
                [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                inputsManager,
                AppMode.GAME,
                soloGameProps.level,
                undefined,
                undefined,
                soloGameProps.onGameFinished,
            );
            appRef.current.registerSoloModeListeners();
            if (isMobile) {
                appRef.current.onAddMobileInteractButton =
                    handleAddMobileInteractButton;
                appRef.current.onRemoveMobileInteractButton =
                    handleRemoveMobileInteractButton;
            }
        }
        // https://greensock.com/docs/v3/GSAP/gsap.ticker

        gsap.ticker.fps(60);
        gsap.ticker.add(gameLoop);

        return () => {
            cleanUp();
        };
    }, []);

    useEffect(() => {
        if (!tabIsHidden && isSynchronizingTime && multiplayerGameProps) {
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
                multiplayerGameProps.socketController
                    ?.synchronizeTime()
                    .then(onTimeSynchronized);
            }
        }

        return () => {
            appRef.current?.inputsManager.destroyEventListeners();
        };
    }, [tabIsHidden, multiplayerGameProps, isSynchronizingTime]);

    return (
        <>
            {isSynchronizingTime && (
                <div className="game-sync-overlay">
                    <h3 className="title-h3">Synchronizing</h3>
                    <CircularProgress className="game-sync-overlay__progress" />
                    <div>
                        {!isMobile && (
                            <div className="game-sync-overlay__motions">
                                <h4 className="title-h4">Default motions</h4>
                                <div>
                                    <span className="keyboard-key">A</span>
                                    <span className="keyboard-key">D</span>
                                </div>
                                <div>
                                    <span className="keyboard-key rotate">
                                        ⮕
                                    </span>
                                    <span className="keyboard-key">⮕</span>
                                </div>
                                <span className="keyboard-key space">
                                    Space
                                </span>
                            </div>
                        )}
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
            {isMobile && !levelEditorProps && (
                <MobileHUD
                    isMobileInteractButtonAdded={isMobileInteractButtonAdded}
                    inputsManager={inputsManager}
                />
            )}
            {!isMobile && !levelEditorProps && onExitGame && (
                <DesktopHUD
                    appRef={appRef}
                    onExitGame={onExitGame}
                    withActionsContainer={Boolean(soloGameProps)}
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
