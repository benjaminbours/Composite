import {
    CreateLobbyPayload,
    FriendJoinLobbyPayload,
    GameState,
    InviteFriendTokenPayload,
    MatchMakingPayload,
    Side,
    SocketEventTeamLobby,
    SocketEventType,
} from '@benjaminbours/composite-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuScene, Route } from './types';
import { SocketController } from './SocketController';
import { TweenOptions } from './Menu/tweens';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Curve, { defaultWaveOptions } from './Menu/canvas/Curve';
import { servicesContainer } from './core/frameworks';
import { ApiClient } from './core/services';
import { Level, User } from '@benjaminbours/composite-api-client';
import { useSnackbar } from 'notistack';
import { useStoreState } from './hooks';

export interface MainState {
    side: Side | undefined;
    selectedLevel: number | undefined;
    gameState: GameState | undefined;
    teamMate: User | 'guest' | 'disconnected' | undefined;
    levelSelectedByTeamMate: number | undefined;
    sideSelectedByTeamMate: Side | undefined;
    loadedLevel: Level | undefined;
}

export function useMainController(
    menuScene: MenuScene,
    setMenuScene: React.Dispatch<React.SetStateAction<MenuScene>>,
    goToStep: (tweenOptions: TweenOptions, onComplete?: () => void) => void,
    lightToStep: (options: TweenOptions, isMobileDevice: boolean) => void,
    shadowToStep: (options: TweenOptions, isMobileDevice: boolean) => void,
    onTransition: React.MutableRefObject<boolean>,
) {
    const { enqueueSnackbar } = useSnackbar();
    const currentUser = useStoreState((state) => state.user.currentUser);
    const queryParams = useSearchParams();
    const router = useRouter();
    // const path = usePathname();
    const socketController = useRef<SocketController>();

    const [state, setState] = useState<MainState>(() => {
        if (process.env.NEXT_PUBLIC_STAGE === 'development') {
            let side = undefined;
            let selectedLevel = undefined;

            if (process.env.NEXT_PUBLIC_SOLO_MODE) {
                const parts = process.env.NEXT_PUBLIC_SOLO_MODE.split(',').map(
                    (str) => Number(str),
                );
                side = parts[0] as Side;
                selectedLevel = parts[1];
            }

            const param = queryParams.get('dev_state');
            if (param) {
                const parts = param.split(',').map((str) => Number(str));
                side = parts[0] as Side;
                selectedLevel = parts[1];
            }

            return {
                side,
                selectedLevel,
                gameState: undefined,
                levelSelectedByTeamMate: undefined,
                sideSelectedByTeamMate: undefined,
                loadedLevel: undefined,
                teamMate: undefined,
            };
        }

        return {
            side: undefined,
            selectedLevel: undefined,
            gameState: undefined,
            levelSelectedByTeamMate: undefined,
            sideSelectedByTeamMate: undefined,
            loadedLevel: undefined,
            teamMate: undefined,
        };
    });
    const [levels, setLevels] = useState<Level[]>([]);

    // const [teamMateDisconnected, setTeamMateDisconnected] = useState(false);
    // TODO: change this concept, not sustainable, bad design from before
    // const [menuMode, setMenuMode] = useState<MenuMode>(MenuMode.DEFAULT);
    const [gameIsPlaying, setGameIsPlaying] = useState(false);

    // lobby animation effect
    useEffect(() => {
        if (menuScene !== MenuScene.TEAM_LOBBY) {
            return;
        }

        const isMobile = window.innerWidth < 768;
        // curve
        if (
            state.selectedLevel !== undefined &&
            state.levelSelectedByTeamMate !== undefined &&
            state.selectedLevel === state.levelSelectedByTeamMate
        ) {
            Curve.setWaveOptions({
                speed: 0.4,
            });
        } else {
            Curve.setWaveOptions({
                ...defaultWaveOptions,
            });
        }

        // light
        if (
            state.side === Side.LIGHT ||
            state.sideSelectedByTeamMate === Side.LIGHT
        ) {
            lightToStep({ step: MenuScene.TEAM_LOBBY_SELECTED }, isMobile);
        } else {
            lightToStep({ step: MenuScene.TEAM_LOBBY }, isMobile);
        }

        // shadow
        if (
            state.side === Side.SHADOW ||
            state.sideSelectedByTeamMate === Side.SHADOW
        ) {
            shadowToStep({ step: MenuScene.TEAM_LOBBY_SELECTED }, isMobile);
        } else {
            shadowToStep({ step: MenuScene.TEAM_LOBBY }, isMobile);
        }
    }, [state, menuScene, lightToStep, shadowToStep]);

    // responsible to fetch the levels
    useEffect(() => {
        const apiClient = servicesContainer.get(ApiClient);
        apiClient.defaultApi.levelsControllerFindAll().then((levels) => {
            setLevels(levels);
        });
    }, []);

    const sendMatchMakingInfo = useCallback((payload: MatchMakingPayload) => {
        socketController.current?.emit([
            SocketEventType.MATCHMAKING_INFO,
            payload,
        ]);
    }, []);

    // const handleClickOnJoinTeamMate = useCallback(() => {
    //     if (!teamMateInfo) {
    //         return;
    //     }
    //     const matchMakingInfo = {
    //         side: teamMateInfo.side === Side.SHADOW ? Side.LIGHT : Side.SHADOW,
    //         selectedLevel: teamMateInfo.selectedLevel,
    //     };
    //     setState((prev) => ({
    //         ...prev,
    //         ...matchMakingInfo,
    //     }));
    //     setTeamMateInfo(undefined);
    //     socketController.current?.emit([
    //         SocketEventType.MATCHMAKING_INFO,
    //         matchMakingInfo,
    //     ]);
    // }, [teamMateInfo]);

    // const handleClickFindAnotherTeamMate = useCallback(() => {
    //     router.push(Route.HOME);
    //     if (gameIsPlaying) {
    //         setGameIsPlaying(false);
    //         setMenuScene(MenuScene.HOME);
    //         setTeamMateInfo(undefined);
    //     } else {
    //         goToStep(
    //             {
    //                 step: MenuScene.HOME,
    //                 side: undefined,
    //             },
    //             () => {
    //                 setMenuScene(MenuScene.HOME);
    //                 setTeamMateInfo(undefined);
    //             },
    //         );
    //     }
    // }, [router, gameIsPlaying, goToStep, setMenuScene]);

    const handleSelectLevelOnLobby = useCallback((levelId: number) => {
        setState((prev) => ({
            ...prev,
            selectedLevel: levelId,
        }));
        socketController.current?.emit([
            SocketEventTeamLobby.SELECT_LEVEL,
            levelId,
        ]);
    }, []);

    const handleSelectSideOnLobby = useCallback((side: Side) => {
        setState((prev) => ({
            ...prev,
            side,
        }));
        socketController.current?.emit([
            SocketEventTeamLobby.SELECT_SIDE,
            side,
        ]);
    }, []);

    const handleTeamMateJoinLobby = useCallback(
        (data: FriendJoinLobbyPayload) => {
            setState((prev) => ({
                ...prev,
                teamMate: data.user || 'guest',
                sideSelectedByTeamMate: data.side,
                levelSelectedByTeamMate: data.level || levels[0].id,
            }));
            enqueueSnackbar('Your friend successfully joined the lobby', {
                variant: 'success',
            });
        },
        [enqueueSnackbar, levels],
    );

    const handleDestroyConnection = useCallback(() => {
        socketController.current?.destroy();
        socketController.current = undefined;
    }, []);

    const handleTeamMateDisconnect = useCallback(() => {
        setState((prev) => ({
            ...prev,
            side: undefined,
            selectedLevel: undefined,
            teamMate: 'disconnected',
            sideSelectedByTeamMate: undefined,
            levelSelectedByTeamMate: undefined,
        }));
        handleDestroyConnection();
    }, [handleDestroyConnection]);

    const handleGameStart = useCallback((initialGameState: GameState) => {
        const apiClient = servicesContainer.get(ApiClient);
        apiClient.defaultApi
            .levelsControllerFindOne({ id: String(initialGameState.level.id) })
            .then((level) => {
                setState((prev) => ({
                    ...prev,
                    gameState: initialGameState,
                    loadedLevel: level,
                }));
                setGameIsPlaying(true);
                // setMenuMode(MenuMode.IN_TEAM);
            });
    }, []);

    const handleGameFinished = useCallback(() => {
        setState((prev) => ({
            side: prev.side,
            selectedLevel: undefined,
            sideSelectedByTeamMate: undefined,
            levelSelectedByTeamMate: undefined,
            gameState: undefined,
            loadedLevel: undefined,
            teamMate: undefined,
        }));
        setGameIsPlaying(false);
        setMenuScene(MenuScene.END_LEVEL);
    }, [setMenuScene]);

    const handleReceiveLevelOnLobby = useCallback((levelId: number) => {
        setState((prev) => ({
            ...prev,
            levelSelectedByTeamMate: levelId,
        }));
    }, []);

    const handleReceiveSideOnLobby = useCallback((side: Side) => {
        setState((prev) => ({
            ...prev,
            sideSelectedByTeamMate: side,
        }));
    }, []);

    const establishConnection = useCallback(async () => {
        return import('./SocketController')
            .then((mod) => mod.SocketController)
            .then((SocketController) => {
                socketController.current = new SocketController(
                    handleGameStart,
                    handleGameFinished,
                    handleTeamMateDisconnect,
                    handleTeamMateJoinLobby,
                    handleReceiveLevelOnLobby,
                    handleReceiveSideOnLobby,
                );
                return;
            });
    }, [
        handleGameFinished,
        handleGameStart,
        handleTeamMateDisconnect,
        handleTeamMateJoinLobby,
        handleReceiveLevelOnLobby,
        handleReceiveSideOnLobby,
    ]);

    // callback when the invited user is joining the lobby
    const handleEnterTeamLobby = useCallback(
        (inviteFriendToken: string) => {
            if (socketController.current) {
                return;
            }
            establishConnection().then(() => {
                socketController.current?.emit([
                    SocketEventTeamLobby.FRIEND_JOIN_LOBBY,
                    {
                        token: inviteFriendToken,
                        user: currentUser,
                    },
                ]);
                enqueueSnackbar('Successfully joined the lobby!', {
                    variant: 'success',
                });
            });
        },
        [establishConnection, enqueueSnackbar, currentUser],
    );

    const handleInviteFriend = useCallback(async (): Promise<string> => {
        return establishConnection().then(() => {
            return new Promise((resolve) => {
                // register listener before emitting
                socketController.current?.socket.on(
                    SocketEventTeamLobby.INVITE_FRIEND_TOKEN,
                    (data: InviteFriendTokenPayload) => {
                        resolve(
                            `${process.env.NEXT_PUBLIC_URL}/lobby?token=${data.token}`,
                        );
                        // clean up listener
                        socketController.current?.socket.removeAllListeners(
                            SocketEventTeamLobby.INVITE_FRIEND_TOKEN,
                        );
                    },
                );
                // emit request
                socketController.current?.emit([
                    SocketEventTeamLobby.CREATE_LOBBY,
                    {
                        userId: currentUser?.id || undefined,
                        side: state.side,
                        level: state.selectedLevel,
                    } as CreateLobbyPayload,
                ]);
            });
        });
    }, [establishConnection, currentUser, state]);

    const handleEnterRandomQueue = useCallback(
        (side: Side) => {
            if (onTransition.current || state.selectedLevel === undefined) {
                return;
            }
            establishConnection().then(() => {
                setState((prev) => ({ ...prev, side }));
                sendMatchMakingInfo({
                    selectedLevel: state.selectedLevel!,
                    side,
                });
            });
            goToStep({
                step: MenuScene.QUEUE,
                side,
            });
        },
        [
            establishConnection,
            sendMatchMakingInfo,
            goToStep,
            onTransition,
            state,
        ],
    );

    const handleSelectLevel = useCallback(
        (levelId: number) => {
            if (onTransition.current) {
                return;
            }
            setState((prev) => ({
                ...prev,
                selectedLevel: levelId,
            }));
            goToStep({
                step: MenuScene.FACTION,
                side: undefined,
            });
        },
        [goToStep, onTransition],
    );

    const handleClickOnBack = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        const backOptions = {
            invite_friend() {
                goToStep({ step: MenuScene.HOME, side: undefined });
            },
            level() {
                goToStep({ step: MenuScene.HOME, side: undefined });
            },
            faction() {
                goToStep({ step: MenuScene.LEVEL, side: undefined });
            },
            queue() {
                goToStep(
                    {
                        step: MenuScene.FACTION,
                        side: state.side,
                    },
                    () => {
                        setState((prev) => ({
                            ...prev,
                            side: undefined,
                        }));
                        // TODO: Be careful about this part, test all behaviors with last changes
                        // if (menuMode === MenuMode.DEFAULT) {
                        //     handleDestroyConnection();
                        // }
                    },
                );
            },
        };
        // there is no back button on these scenes
        if (
            menuScene !== MenuScene.HOME &&
            menuScene !== MenuScene.END_LEVEL &&
            menuScene !== MenuScene.TEAM_LOBBY &&
            menuScene !== MenuScene.TEAM_LOBBY_SELECTED &&
            menuScene !== MenuScene.NOT_FOUND
        ) {
            backOptions[menuScene]();
        }
    }, [
        menuScene,
        state.side,
        // handleDestroyConnection,
        goToStep,
        onTransition,
    ]);

    const handleClickOnQuitTeam = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        router.push(Route.HOME);
        goToStep({ step: MenuScene.HOME, side: undefined }, () => {
            handleDestroyConnection();
        });
    }, [goToStep, handleDestroyConnection, onTransition, router]);

    // use only on not found page so far
    const handleClickHome = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        router.push(Route.HOME);
        goToStep({
            step: MenuScene.HOME,
            side: undefined,
        });
    }, [goToStep, router, onTransition]);

    const handleClickPlayWithRandom = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        goToStep({ step: MenuScene.LEVEL, side: undefined });
    }, [goToStep, onTransition]);

    const handleClickPlayAgain = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        goToStep({ step: MenuScene.TEAM_LOBBY, side: undefined }, () => {
            setState((prev) => ({
                ...prev,
                side: undefined,
            }));
        });
    }, [goToStep, onTransition, setState]);

    // // development effect
    // useEffect(() => {
    //     if (process.env.NEXT_PUBLIC_SOLO_MODE) {
    //         establishConnection().then(() => {
    //             const level = (() => {
    //                 switch (state.selectedLevel) {
    //                     // case Levels.CRACK_THE_DOOR:
    //                     //     return new CrackTheDoorLevelWithGraphic();
    //                     // case Levels.LEARN_TO_FLY:
    //                     //     return new LearnToFlyLevelWithGraphic();
    //                     // case Levels.THE_HIGH_SPHERES:
    //                     //     return new TheHighSpheresLevelWithGraphic();
    //                     default:
    //                         return new CrackTheDoorLevelWithGraphic();
    //                 }
    //             })();
    //             const initialGameState = new GameState(
    //                 [
    //                     {
    //                         position: {
    //                             x: level.startPosition.shadow.x,
    //                             y: level.startPosition.shadow.y,
    //                         },
    //                         velocity: {
    //                             x: 0,
    //                             y: 0,
    //                         },
    //                         state: MovableComponentState.onFloor,
    //                         insideElementID: undefined,
    //                     },
    //                     {
    //                         position: {
    //                             x: level.startPosition.light.x,
    //                             y: level.startPosition.light.y,
    //                         },
    //                         velocity: {
    //                             x: 0,
    //                             y: 0,
    //                         },
    //                         state: MovableComponentState.onFloor,
    //                         insideElementID: undefined,
    //                     },
    //                 ],
    //                 {
    //                     ...level.state,
    //                 },
    //                 Date.now(),
    //                 0,
    //             );
    //             handleGameStart(initialGameState);
    //         });
    //         return () => {
    //             handleDestroyConnection();
    //         };
    //     }
    //     if (
    //         process.env.NEXT_PUBLIC_STAGE === 'development' &&
    //         state.side !== undefined &&
    //         socketController.current === undefined
    //     ) {
    //         console.log('enter random queue');
    //         handleEnterRandomQueue(state.side);
    //     }

    //     return () => {
    //         handleDestroyConnection();
    //     };
    // }, []);

    return {
        state,
        socketController,
        // teamMateInfo,
        gameIsPlaying,
        levels,
        handleGameStart,
        establishConnection,
        // handleClickOnJoinTeamMate,
        // handleClickFindAnotherTeamMate,
        handleInviteFriend,
        handleEnterTeamLobby,
        handleClickPlayWithFriend: handleInviteFriend,
        handleClickPlayWithRandom,
        handleEnterRandomQueue,
        handleSelectLevelOnLobby,
        handleSelectSideOnLobby,
        handleSelectLevel,
        handleClickOnBack,
        handleClickOnQuitTeam,
        handleClickHome,
        handleClickPlayAgain,
    };
}
