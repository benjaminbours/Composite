'use client';
// vendors
import { gsap } from 'gsap';
import React, { useEffect, useRef, useState } from 'react';
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

interface LevelEditorProps {
    // use do save the app instance somewhere else
    onAppLoaded: (app: App) => void;
    // TODO: Don't like so much the management of this callback
    onTransformControlsObjectChange: (object: THREE.Object3D) => void;
}

interface MultiplayerGameProps {
    initialGameState: GameState;
    socketController?: SocketController;
    level: Level;
}

interface Props {
    side: Side;
    inputsManager: InputsManager;
    tabIsHidden: boolean;
    stats: React.MutableRefObject<Stats | undefined>;
    multiplayerGameProps?: MultiplayerGameProps;
    levelEditorProps?: LevelEditorProps;
}

function Game({
    side,
    tabIsHidden,
    stats,
    inputsManager,
    multiplayerGameProps,
    levelEditorProps,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasMiniMapRef = useRef<HTMLCanvasElement>(null);
    const appRef = useRef<App>();
    const [isSynchronizingTime, setIsSynchronizingTime] = useState(false);

    const isMobile = window.innerWidth <= 768;

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
                <div className="game-sync-overlay">is Synchronizing</div>
            )}
            {isMobile && appRef.current && (
                <MobileHUD inputsManager={appRef.current.inputsManager} />
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
