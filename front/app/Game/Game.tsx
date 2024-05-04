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
import { CircularProgress, Divider } from '@mui/material';

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
                <div className="game-sync-overlay">
                    <h3 className="title-h3">is Synchronizing</h3>
                    <CircularProgress className="game-sync-overlay__progress" />
                    <div>
                        <div className="game-sync-overlay__motions">
                            <h4 className="title-h4">Default motions</h4>
                            <div>
                                <span className="keyboard-key">A</span>
                                <span className="keyboard-key">D</span>
                            </div>
                            <div>
                                <span className="keyboard-key rotate">⮕</span>
                                <span className="keyboard-key">⮕</span>
                            </div>
                            <span className="keyboard-key space">Space</span>
                        </div>
                        <div className="game-sync-overlay__tips">
                            <h4 className="title-h4">Tips</h4>
                            <p>
                                {`The minimap at the bottom right provides information about
                        your teammate's position.`}
                            </p>
                            <Divider />
                            <p>{`Any door can be open.`}</p>
                            <Divider />
                            <p>
                                {`It's funnier if you can speak by voice with your teammate.`}
                            </p>
                            <a
                                href="https://discord.com/invite/pXPU8xeabp"
                                target="_blank"
                                className="buttonRect"
                            >
                                Join our Discord&nbsp;
                                <svg viewBox="0 -28.5 256 256">
                                    <g>
                                        <path
                                            d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                                            fill-rule="nonzero"
                                        />
                                    </g>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
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
