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
// our libs
import {
    GameState,
    Levels,
    MatchMakingPayload,
    PositionLevel,
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
    const [state, setState] = useState<MainState>({
        // side: Side.LIGHT,
        // selectedLevel: Levels.CRACK_THE_DOOR,
        side: undefined,
        selectedLevel: undefined,
        gameState: undefined,
    });
    const [gameIsPlaying, setGameIsPlaying] = useState(false);
    const [teamMateDisconnect, setTeamMateDisconnect] = useState(false);
    const [teamMateInfo, setTeamMateInfo] = useState<TeammateInfoPayload>();
    const [tabIsHidden, setTabIsHidden] = useState(false);
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
            menuScene === MenuScene.QUEUE &&
            state.side !== undefined &&
            state.selectedLevel !== undefined,
        [state, menuMode, menuScene],
    );

    const handleGameStart = useCallback((initialGameState: GameState) => {
        setState((prev) => ({ ...prev, gameState: initialGameState }));
        setGameIsPlaying(true);
        setMenuScene(MenuScene.END_LEVEL);
        setMenuMode(MenuMode.IN_TEAM);
    }, []);

    const handleGameFinished = useCallback(() => {
        setGameIsPlaying(false);
    }, []);

    const handleTeamMateDisconnect = useCallback(() => {
        setMenuMode(MenuMode.DEFAULT);
        setTeamMateDisconnect(true);
    }, []);

    const handleTeamMateInfo = useCallback((data: TeammateInfoPayload) => {
        setTeamMateInfo(data);
    }, []);

    const handleClickFindAnotherTeamMate = useCallback(() => {
        import('./Menu/Animation')
            .then((mod) => mod.default)
            .then((Animation) => {
                Animation.goToStep(MenuScene.HOME, () => {
                    setMenuScene(MenuScene.HOME);
                    setTeamMateDisconnect(false);
                });
            });
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabIsHidden(true);
            } else {
                setTabIsHidden(false);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
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
            // establishConnection().then(() => {
            //     const level = new PositionLevel();
            //     const initialGameState = new GameState(
            //         [
            //             {
            //                 position: {
            //                     x: level.startPosition.shadow.x,
            //                     y: level.startPosition.shadow.y,
            //                 },
            //                 velocity: {
            //                     x: 0,
            //                     y: 0,
            //                 },
            //             },
            //             {
            //                 position: {
            //                     x: level.startPosition.light.x,
            //                     y: level.startPosition.light.y,
            //                 },
            //                 velocity: {
            //                     x: 0,
            //                     y: 0,
            //                 },
            //             },
            //         ],
            //         {
            //             ...level.state,
            //             doors: {
            //                 ...level.state.doors,
            //                 ground: [0],
            //                 roof: [0],
            //             },
            //         },
            //         Date.now(),
            //         0,
            //     );
            //     handleGameStart(initialGameState);
            // });
        } else if (shouldSendMatchMakingInfo) {
            sendMatchMakingInfo();
        }
    }, [gameIsPlaying, shouldEstablishConnection, shouldSendMatchMakingInfo]);

    const handleDestroyConnection = useCallback(() => {
        socketController.current?.destroy();
        socketController.current = undefined;
        setMenuMode(MenuMode.DEFAULT);
    }, [menuMode]);

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
        socketController.current?.emit([
            SocketEventType.MATCHMAKING_INFO,
            matchMakingInfo,
        ]);
    }, [teamMateInfo]);

    // return (
    //     <>
    //         {/* {!state.isGameRunning && (
    //             <Menu mainState={state} setMainState={setState} />
    //         )} */}
    //         {state.gameState && (
    //             <Game
    //                 initialGameState={state.gameState}
    //                 side={state.side!}
    //                 socketController={socketController.current}
    //                 tabIsHidden={tabIsHidden}
    //             />
    //         )}
    //     </>
    // );

    return (
        <>
            {teamMateDisconnect && (
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
                />
            )}
            {state.gameState && gameIsPlaying && (
                <Game
                    side={state.side!}
                    initialGameState={state.gameState}
                    socketController={socketController.current}
                    tabIsHidden={tabIsHidden}
                />
            )}
        </>
    );
}

export default MainApp;
