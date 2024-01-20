'use client';
// vendors
import React, {
    createContext,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
import * as STATS from 'stats.js';
// our libs
import {
    GameState,
    InviteFriendTokenPayload,
    Levels,
    MatchMakingPayload,
    MovableComponentState,
    PositionLevel,
    ProjectionLevel,
    Side,
    SocketEventType,
    TeammateInfoPayload,
} from '@benjaminbours/composite-core';
// local
import type { SocketController } from './SocketController';
import { MenuMode, MenuScene } from './Menu/types';
import { SettingsMenu } from './SettingsMenu';
import InputsManager from './Game/Player/InputsManager';
import { BottomRightInfo } from './BottomRightInfo';

export const AppContext = createContext({
    setMenuScene: (_scene: MenuScene) => {},
    onEnterTeamLobby: (_token: string) => {},
});

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

interface Props {
    children: React.ReactNode;
}

/**
 * MainApp is responsible to manage the orchestration between the Menu (2D part, the queue management, etc), the game (3D part) and the socket connection.
 */
function MainApp({ children }: Props) {
    const socketController = useRef<SocketController>();
    const inputsManager = useRef<InputsManager>(new InputsManager());
    const [menuScene, setMenuScene] = useState<MenuScene>(MenuScene.HOME);
    const [nextMenuScene, setNextMenuScene] = useState<MenuScene | undefined>(
        undefined,
    );
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
    const [inviteFriendToken, setInviteFriendToken] = useState<
        string | undefined
    >(undefined);
    const [friendIsInLobby, setFriendIsInLobby] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [gameIsPlaying, setGameIsPlaying] = useState(false);
    const [teamMateDisconnected, setTeamMateDisconnected] = useState(false);
    const [teamMateInfo, setTeamMateInfo] = useState<TeammateInfoPayload>();
    const [tabIsHidden, setTabIsHidden] = useState(false);
    const statsRef = useRef<Stats>();

    // const shouldEstablishConnection = useMemo(
    //     () =>
    //         menuMode === MenuMode.DEFAULT &&
    //         menuScene === MenuScene.QUEUE &&
    //         state.side !== undefined &&
    //         state.selectedLevel !== undefined &&
    //         !socketController.current,
    //     [state, menuMode, menuScene],
    // );
    // const shouldSendMatchMakingInfo = useMemo(
    //     () =>
    //         !gameIsPlaying &&
    //         menuScene === MenuScene.QUEUE &&
    //         state.side !== undefined &&
    //         state.selectedLevel !== undefined,
    //     [state, menuMode, menuScene, gameIsPlaying],
    // );

    const handleReceiveInviteFriendToken = useCallback(
        (data: InviteFriendTokenPayload) => {
            setInviteFriendToken(data.token);
        },
        [],
    );

    const handleClickOnSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    const handleClickOnCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
    }, []);

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
        setFriendIsInLobby(false);
    }, []);

    const handleTeamMateDisconnect = useCallback(() => {
        setTeamMateDisconnected(true);
        setState((prev) => ({
            ...prev,
            side: undefined,
            selectedLevel: undefined,
        }));
        handleDestroyConnection();
    }, [handleDestroyConnection]);

    const handleTeamMateInfo = useCallback((data: TeammateInfoPayload) => {
        console.log('HERE receive team mate info');
        setTeamMateInfo(data);
    }, []);

    const handleClickFindAnotherTeamMate = useCallback(() => {
        setGameIsPlaying(false);
        setMenuScene(MenuScene.HOME);
        setTeamMateDisconnected(false);
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

    // effect dedicated to tab switching
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

    const handleJoinLobby = useCallback(() => {
        console.log('joined lobby');
        setMenuMode(MenuMode.IN_TEAM);
        setFriendIsInLobby(true);
    }, []);

    const establishConnection = useCallback(async () => {
        return import('./SocketController')
            .then((mod) => mod.SocketController)
            .then((SocketController) => {
                socketController.current = new SocketController(
                    handleGameStart,
                    handleGameFinished,
                    handleTeamMateDisconnect,
                    handleTeamMateInfo,
                    handleReceiveInviteFriendToken,
                    handleJoinLobby,
                );
                return;
            });
    }, [
        handleGameFinished,
        handleGameStart,
        handleTeamMateDisconnect,
        handleTeamMateInfo,
        handleReceiveInviteFriendToken,
        handleJoinLobby,
    ]);

    const sendMatchMakingInfo = useCallback((payload: MatchMakingPayload) => {
        socketController.current?.emit([
            SocketEventType.MATCHMAKING_INFO,
            payload,
        ]);
    }, []);

    const onEnterRandomQueue = useCallback(
        (payload: MatchMakingPayload) => {
            establishConnection().then(() => sendMatchMakingInfo(payload));
        },
        [establishConnection, sendMatchMakingInfo],
    );

    const onEnterInviteFriend = useCallback(() => {
        establishConnection().then(() => {
            socketController.current?.emit([
                SocketEventType.REQUEST_INVITE_FRIEND_TOKEN,
            ]);
        });
    }, [establishConnection]);

    const onEnterTeamLobby = useCallback(
        (inviteFriendToken: string) => {
            if (socketController.current) {
                return;
            }
            setMenuMode(MenuMode.IN_TEAM);
            establishConnection().then(() => {
                socketController.current?.emit([
                    SocketEventType.FRIEND_JOIN_LOBBY,
                    inviteFriendToken,
                ]);
            });
        },
        [establishConnection],
    );

    // event dedicated to socket connection
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_SKIP_MATCHMAKING) {
            import('./SocketController')
                .then((mod) => mod.SocketController)
                .then((SocketController) => {
                    socketController.current = new SocketController(
                        handleGameStart,
                        handleGameFinished,
                        handleTeamMateDisconnect,
                        handleTeamMateInfo,
                        handleReceiveInviteFriendToken,
                        handleJoinLobby,
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
                                state: MovableComponentState.onFloor,
                                insideElementID: undefined,
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
                                state: MovableComponentState.onFloor,
                                insideElementID: undefined,
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
            // if (shouldEstablishConnection) {
            //     import('./SocketController')
            //         .then((mod) => mod.SocketController)
            //         .then((SocketController) => {
            //             socketController.current = new SocketController(
            //                 handleGameStart,
            //                 handleGameFinished,
            //                 handleTeamMateDisconnect,
            //                 handleTeamMateInfo,
            //             );
            //             return;
            //         })
            //         .then(sendMatchMakingInfo);
            // } else
            // if (shouldSendMatchMakingInfo) {
            //     console.log('HERE send match making info');
            //     sendMatchMakingInfo();
            // }
        }
    }, [
        handleGameFinished,
        handleGameStart,
        handleReceiveInviteFriendToken,
        handleTeamMateDisconnect,
        handleTeamMateInfo,
        handleJoinLobby,
    ]);

    if (process.env.NEXT_PUBLIC_SKIP_MATCHMAKING) {
        return (
            <>
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
                        inputsManager={inputsManager.current}
                        handleClickFindAnotherTeamMate={
                            handleClickFindAnotherTeamMate
                        }
                        teamMateDisconnected={teamMateDisconnected}
                    />
                )}
                {/* TODO: Don't forget to add it when not in skip matchmaking mode */}
                {isSettingsOpen && (
                    <SettingsMenu
                        inputsManager={inputsManager.current}
                        onClose={handleClickOnCloseSettings}
                    />
                )}
                <BottomRightInfo onSettingsClick={handleClickOnSettings} />
            </>
        );
    }

    return (
        <>
            <AppContext.Provider value={{ setMenuScene, onEnterTeamLobby }}>
                {!gameIsPlaying && (
                    <Menu
                        mainState={state}
                        setMainState={setState}
                        menuScene={menuScene}
                        nextMenuScene={nextMenuScene}
                        mode={menuMode}
                        setMenuScene={setMenuScene}
                        setNextMenuScene={setNextMenuScene}
                        destroyConnection={handleDestroyConnection}
                        teamMate={{
                            info: teamMateInfo,
                            onJoin: handleClickOnJoinTeamMate,
                        }}
                        teamMateDisconnected={teamMateDisconnected}
                        setTeamMateDisconnected={setTeamMateDisconnected}
                        stats={statsRef}
                        enterRandomQueue={onEnterRandomQueue}
                        enterInviteFriend={onEnterInviteFriend}
                        inviteFriendToken={inviteFriendToken}
                        friendIsInLobby={friendIsInLobby}
                    />
                )}
                {state.gameState && gameIsPlaying && (
                    <Game
                        side={state.side!}
                        initialGameState={state.gameState}
                        socketController={socketController.current}
                        tabIsHidden={tabIsHidden}
                        stats={statsRef}
                        inputsManager={inputsManager.current}
                        handleClickFindAnotherTeamMate={
                            handleClickFindAnotherTeamMate
                        }
                        teamMateDisconnected={teamMateDisconnected}
                    />
                )}
                {isSettingsOpen && (
                    <SettingsMenu
                        inputsManager={inputsManager.current}
                        onClose={handleClickOnCloseSettings}
                    />
                )}
                <BottomRightInfo onSettingsClick={handleClickOnSettings} />
                {children}
            </AppContext.Provider>
        </>
    );
}

export default MainApp;
