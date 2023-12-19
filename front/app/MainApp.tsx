'use client';
// vendors
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
import * as STATS from 'stats.js';
// our libs
import {
    GameState,
    Levels,
    MatchMakingPayload,
    PositionLevel,
    ProjectionLevel,
    Side,
    SocketEventType,
    TeammateInfoPayload,
} from '@benjaminbours/composite-core';
// local
import type { SocketController } from './SocketController';
import { MenuMode, MenuScene } from './Menu/types';

const Menu = dynamic(() => import('./Menu'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

const Game = dynamic(() => import('./Game'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

// almost the same state in Menu
export interface MainState {
    side: Side | undefined;
    selectedLevel: Levels | undefined;
    gameState: GameState | undefined;
}

// TODO: Ability to restart a game from the same session without reloading or changing team mate
function MainApp() {
    const socketController = useRef<SocketController>();
    const [menuScene, setMenuScene] = useState<MenuScene>(MenuScene.HOME);
    const [menuMode, setMenuMode] = useState<MenuMode>(MenuMode.DEFAULT);
    const [state, setState] = useState<MainState>(() => {
        if (process.env.NEXT_PUBLIC_SKIP_MATCHMAKING) {
            return {
                side: Side.LIGHT,
                selectedLevel: Levels.LEARN_TO_FLY,
                gameState: undefined,
            };
        }
        return {
            side: undefined,
            selectedLevel: undefined,
            gameState: undefined,
        };
    });
    const [gameIsPlaying, setGameIsPlaying] = useState(false);
    const [teamMateDisconnected, setTeamMateDisconnected] = useState(false);
    const [teamMateInfo, setTeamMateInfo] = useState<TeammateInfoPayload>();
    const [tabIsHidden, setTabIsHidden] = useState(false);
    const statsRef = useRef<Stats>();

    const shouldEstablishConnection = useMemo(
        () =>
            menuMode === MenuMode.DEFAULT &&
            menuScene === MenuScene.QUEUE &&
            state.side !== undefined &&
            state.selectedLevel !== undefined &&
            !socketController.current,
        [state, menuMode, menuScene],
    );
    const shouldSendMatchMakingInfo = useMemo(
        () =>
            !gameIsPlaying &&
            menuScene === MenuScene.QUEUE &&
            state.side !== undefined &&
            state.selectedLevel !== undefined,
        [state, menuMode, menuScene, gameIsPlaying],
    );

    const handleGameStart = useCallback((initialGameState: GameState) => {
        setState((prev) => ({ ...prev, gameState: initialGameState }));
        setGameIsPlaying(true);
        setMenuMode(MenuMode.IN_TEAM);
    }, []);

    const handleGameFinished = useCallback(() => {
        setGameIsPlaying(false);
        setMenuScene(MenuScene.END_LEVEL);
    }, []);

    const handleDestroyConnection = useCallback(() => {
        socketController.current?.destroy();
        socketController.current = undefined;
        setMenuMode(MenuMode.DEFAULT);
    }, [menuMode]);

    const handleTeamMateDisconnect = useCallback(() => {
        setTeamMateDisconnected(true);
        handleDestroyConnection();
    }, []);

    const handleTeamMateInfo = useCallback((data: TeammateInfoPayload) => {
        console.log('HERE receive team mate info');
        setTeamMateInfo(data);
    }, []);

    const handleClickFindAnotherTeamMate = useCallback(() => {
        import('./Menu/Animation')
            .then((mod) => mod.default)
            .then((Animation) => {
                Animation.goToStep(MenuScene.HOME, () => {
                    setMenuScene(MenuScene.HOME);
                    setTeamMateDisconnected(false);
                });
            });
    }, []);

    const handleClickOnJoinTeamMate = useCallback(() => {
        if (!teamMateInfo) {
            return;
        }
        const matchMakingInfo = {
            side: teamMateInfo.side === Side.SHADOW ? Side.LIGHT : Side.SHADOW,
            selectedLevel: teamMateInfo.selectedLevel,
        };
        setState((prev) => ({
            ...prev,
            ...matchMakingInfo,
        }));
        setTeamMateInfo(undefined);
        socketController.current?.emit([
            SocketEventType.MATCHMAKING_INFO,
            matchMakingInfo,
        ]);
    }, [teamMateInfo]);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_STAGE === 'development') {
            const stats = new STATS.default();
            stats.showPanel(1);
            document.body.appendChild(stats.dom);
            statsRef.current = stats;
        }
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabIsHidden(true);
            } else {
                setTabIsHidden(false);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            if (statsRef.current) {
                document.body.removeChild(statsRef.current.dom);
            }
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);

    useEffect(() => {
        const sendMatchMakingInfo = () => {
            socketController.current?.emit([
                SocketEventType.MATCHMAKING_INFO,
                state as MatchMakingPayload,
            ]);
        };

        if (process.env.NEXT_PUBLIC_SKIP_MATCHMAKING) {
            import('./SocketController')
                .then((mod) => mod.SocketController)
                .then((SocketController) => {
                    socketController.current = new SocketController(
                        handleGameStart,
                        handleGameFinished,
                        handleTeamMateDisconnect,
                        handleTeamMateInfo,
                    );
                    return;
                })
                .then(() => {
                    const level = new ProjectionLevel();
                    const initialGameState = new GameState(
                        [
                            {
                                position: {
                                    x: level.startPosition.shadow.x,
                                    y: level.startPosition.shadow.y,
                                },
                                velocity: {
                                    x: 0,
                                    y: 0,
                                },
                            },
                            {
                                position: {
                                    x: level.startPosition.light.x,
                                    y: level.startPosition.light.y,
                                },
                                velocity: {
                                    x: 0,
                                    y: 0,
                                },
                            },
                        ],
                        {
                            ...level.state,
                        },
                        Date.now(),
                        0,
                    );
                    handleGameStart(initialGameState);
                });
        } else {
            if (shouldEstablishConnection) {
                import('./SocketController')
                    .then((mod) => mod.SocketController)
                    .then((SocketController) => {
                        socketController.current = new SocketController(
                            handleGameStart,
                            handleGameFinished,
                            handleTeamMateDisconnect,
                            handleTeamMateInfo,
                        );
                        return;
                    })
                    .then(sendMatchMakingInfo);
            } else if (shouldSendMatchMakingInfo) {
                console.log('HERE send match making info');
                sendMatchMakingInfo();
            }
        }
    }, [gameIsPlaying, shouldEstablishConnection, shouldSendMatchMakingInfo]);

    if (process.env.NEXT_PUBLIC_SKIP_MATCHMAKING) {
        return (
            <>
                {teamMateDisconnected && (
                    // TODO: Make appear disappear animation
                    <div className="team-mate-disconnect">
                        <p>Your team mate disconnected or has quit the room</p>
                        <button
                            className="buttonRect white"
                            onClick={handleClickFindAnotherTeamMate}
                        >
                            Find another team mate
                        </button>
                    </div>
                )}
                {/* {!state.isGameRunning && (
                    <Menu mainState={state} setMainState={setState} />
                )} */}
                {state.gameState && (
                    <Game
                        initialGameState={state.gameState}
                        side={state.side!}
                        socketController={socketController.current}
                        tabIsHidden={tabIsHidden}
                        stats={statsRef}
                    />
                )}
            </>
        );
    }

    return (
        <>
            {teamMateDisconnected && (
                // TODO: Make appear disappear animation
                <div className="team-mate-disconnect">
                    <p>Your team mate disconnected or has quit the room</p>
                    <button
                        className="buttonRect white"
                        onClick={handleClickFindAnotherTeamMate}
                    >
                        Find another team mate
                    </button>
                </div>
            )}
            {!gameIsPlaying && (
                <Menu
                    mainState={state}
                    setMainState={setState}
                    menuScene={menuScene}
                    mode={menuMode}
                    setMenuScene={setMenuScene}
                    destroyConnection={handleDestroyConnection}
                    teamMate={{
                        info: teamMateInfo,
                        onJoin: handleClickOnJoinTeamMate,
                    }}
                    teamMateDisconnected={teamMateDisconnected}
                    setTeamMateDisconnected={setTeamMateDisconnected}
                    stats={statsRef}
                />
            )}
            {state.gameState && gameIsPlaying && (
                <Game
                    side={state.side!}
                    initialGameState={state.gameState}
                    socketController={socketController.current}
                    tabIsHidden={tabIsHidden}
                    stats={statsRef}
                />
            )}
        </>
    );
}

export default MainApp;
