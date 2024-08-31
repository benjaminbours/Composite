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
    onExitGame: () => void;
    inputsManager: InputsManager;
    stats: React.MutableRefObject<Stats | undefined>;
    gameData?: GameData;
    initialGameState?: GameState;
    levelEditorProps?: LevelEditorProps;
}

function Game({
    onExitGame,
    side,
    stats,
    inputsManager,
    gameData,
    initialGameState,
    levelEditorProps,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasMiniMapRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<App>();
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
                appRef.current.destroy();
            }
        };

        if (!canvasRef.current || !canvasMiniMapRef.current) {
            return;
        }

        if (gameData && initialGameState) {
            if (!appRef.current) {
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
            }
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
            gameData.onGameRendered(appRef.current);
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

    return (
        <div className="game">
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
