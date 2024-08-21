'use client';
// vendors
import { gsap } from 'gsap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    computeBoundsTree,
    disposeBoundsTree,
    acceleratedRaycast,
} from 'three-mesh-bvh/build/index.module.js';
import { BufferGeometry, Mesh, Object3D, Vector2 } from 'three';
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
import { MobileHUD } from './MobileHUD';
import InputsManager from './Player/InputsManager';
import { CircularProgress, Divider } from '@mui/material';
import { DiscordButton } from '../02_molecules/DiscordButton';
import { DesktopHUD } from './DesktopHUD';
import { GameMode, GamePlayerNumber } from '../core/entities/LobbyParameters';
import { GameData } from '../contexts';

interface LevelEditorProps {
    // use do save the app instance somewhere else
    onAppLoaded: (app: App) => void;
    // TODO: Don't like so much the management of this callback
    onTransformControlsObjectChange: (object: Object3D) => void;
}

export interface Props {
    side: Side;
    onExitGame?: () => void;
    inputsManager: InputsManager;
    tabIsHidden: boolean;
    stats: React.MutableRefObject<Stats | undefined>;
    gameData?: GameData;
    initialGameState?: GameState;
    levelEditorProps?: LevelEditorProps;
}

function Game({
    onExitGame,
    side,
    tabIsHidden,
    stats,
    inputsManager,
    gameData,
    initialGameState,
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

        if (gameData && initialGameState) {
            appRef.current = new App(
                canvasRef.current,
                canvasMiniMapRef.current,
                initialGameState,
                [side, side === Side.SHADOW ? Side.LIGHT : Side.SHADOW],
                inputsManager,
                AppMode.GAME,
                gameData.level,
                gameData.lobbyParameters.mode === GameMode.PRACTICE
                    ? undefined
                    : gameData.socketController,
                undefined,
                gameData.lobbyParameters.mode === GameMode.PRACTICE
                    ? gameData.onPracticeGameFinished
                    : undefined,
            );
            if (
                gameData.lobbyParameters.playerNumber === GamePlayerNumber.SOLO
            ) {
                appRef.current.registerSoloModeListeners();
            }
            if (isMobile) {
                appRef.current.onAddMobileInteractButton =
                    handleAddMobileInteractButton;
                appRef.current.onRemoveMobileInteractButton =
                    handleRemoveMobileInteractButton;
            }
            if (gameData.lobbyParameters.mode === GameMode.RANKED) {
                setIsSynchronizingTime(true);
            } else {
                appRef.current?.startRun();
            }
            gameData.onGameRendered();
        } else if (levelEditorProps) {
            const initialGameState = new GameState(
                [
                    {
                        position: new Vector2(
                            200,
                            // TODO: Try better solution than putting the player position below the ground
                            20,
                        ),
                        velocity: new Vector2(0, 0),
                        state: MovableComponentState.inAir,
                        insideElementID: undefined,
                    },
                    {
                        position: new Vector2(10, 20),
                        velocity: new Vector2(0, 0),
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
        if (!tabIsHidden && isSynchronizingTime && gameData) {
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
            gameData.socketController
                ?.synchronizeTime(onStartTimer)
                .then(onTimeSynchronized);
        }

        return () => {
            appRef.current?.inputsManager.destroyEventListeners();
        };
    }, [tabIsHidden, gameData, isSynchronizingTime]);

    return (
        <div className="game">
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
            {isMobile && gameData && (
                <MobileHUD
                    appRef={appRef}
                    isMobileInteractButtonAdded={isMobileInteractButtonAdded}
                    inputsManager={inputsManager}
                    withSwitchPlayer={
                        gameData.lobbyParameters.playerNumber ===
                        GamePlayerNumber.SOLO
                    }
                    onExitGame={onExitGame}
                />
            )}
            {!isMobile && gameData && onExitGame && (
                <DesktopHUD
                    appRef={appRef}
                    level={gameData.level}
                    onExitGame={onExitGame}
                    withActionsContainer={
                        gameData.lobbyParameters.playerNumber ===
                        GamePlayerNumber.SOLO
                    }
                />
            )}
            <canvas ref={canvasRef} id="game" style={{ zIndex: -4 }} />
            <canvas
                ref={canvasMiniMapRef}
                id="minimap"
                style={{ zIndex: -3 }}
            />
        </div>
    );
}

export default Game;
