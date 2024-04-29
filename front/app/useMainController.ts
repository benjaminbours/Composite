import {
    AllQueueInfo,
    CreateLobbyPayload,
    FriendJoinLobbyPayload,
    GameState,
    InviteFriendTokenPayload,
    Side,
    SocketEventLobby,
} from '@benjaminbours/composite-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuScene, Route } from './types';
import { SocketController } from './SocketController';
import { TweenOptions } from './Menu/tweens';
import { useRouter, useSearchParams } from 'next/navigation';
import Curve, { defaultWaveOptions } from './Menu/canvas/Curve';
import { servicesContainer } from './core/frameworks';
import { ApiClient } from './core/services';
import {
    Level,
    LevelStatusEnum,
    User,
} from '@benjaminbours/composite-api-client';
import { useSnackbar } from 'notistack';
import { useStoreState } from './hooks';
import { startLoadingAssets } from './Game/assetsLoader';

export interface PlayerState {
    side: Side | undefined;
    level: number | undefined;
    isReady: boolean;
    account: User | undefined;
}

export interface MainState {
    isInQueue: boolean;
    shouldDisplayQueueInfo: boolean;
    gameState: GameState | undefined;
    loadedLevel: Level | undefined;
    you: PlayerState;
    mate: PlayerState | undefined;
    mateDisconnected: boolean;
}

export const QUEUE_INFO_FETCH_INTERVAL = 20000;

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
    const socketController = useRef<SocketController>();

    useEffect(() => {
        setState((prev) => ({
            ...prev,
            you: { ...prev.you, account: currentUser },
        }));
    }, [currentUser]);

    const [state, setState] = useState<MainState>(() => {
        if (process.env.NEXT_PUBLIC_STAGE === 'local') {
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
                gameState: undefined,
                loadedLevel: undefined,
                you: {
                    side,
                    level: selectedLevel,
                    isReady: false,
                    account: undefined,
                },
                mate: undefined,
                mateDisconnected: false,
                isInQueue: false,
                shouldDisplayQueueInfo: true,
            };
        }

        return {
            gameState: undefined,
            loadedLevel: undefined,
            you: {
                side: undefined,
                level: undefined,
                isReady: false,
                account: undefined,
            },
            mate: undefined,
            mateDisconnected: false,
            isInQueue: false,
            shouldDisplayQueueInfo: true,
        };
    });
    const [levels, setLevels] = useState<Level[]>([]);
    const [gameIsPlaying, setGameIsPlaying] = useState(false);

    // lobby animation effect
    useEffect(() => {
        if (menuScene !== MenuScene.TEAM_LOBBY) {
            return;
        }

        const isMobile = window.innerWidth < 768;
        // curve
        if (
            state.you.level !== undefined &&
            state.mate?.level !== undefined &&
            state.you.level === state.mate?.level
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
        if (state.you.side === Side.LIGHT || state.mate?.side === Side.LIGHT) {
            lightToStep({ step: MenuScene.TEAM_LOBBY_SELECTED }, isMobile);
        } else {
            lightToStep({ step: MenuScene.TEAM_LOBBY }, isMobile);
        }

        // shadow
        if (
            state.you.side === Side.SHADOW ||
            state.mate?.side === Side.SHADOW
        ) {
            shadowToStep({ step: MenuScene.TEAM_LOBBY_SELECTED }, isMobile);
        } else {
            shadowToStep({ step: MenuScene.TEAM_LOBBY }, isMobile);
        }
    }, [state, menuScene, lightToStep, shadowToStep]);

    // responsible to fetch the levels
    useEffect(() => {
        const apiClient = servicesContainer.get(ApiClient);
        apiClient.defaultApi
            .levelsControllerFindAll({ status: LevelStatusEnum.Published })
            .then((levels) => {
                setLevels(levels);
            });
    }, []);

    const handleClickFindAnotherTeamMate = useCallback(() => {
        router.push(Route.LOBBY);
        setGameIsPlaying(false);
        setMenuScene(MenuScene.TEAM_LOBBY);
        setState((prev) => ({
            ...prev,
            loadedLevel: undefined,
            mateDisconnected: false,
            you: {
                isReady: false,
                side: undefined,
                level: undefined,
                account: currentUser || undefined,
            },
            isInQueue: false,
        }));
    }, [router, setMenuScene, currentUser]);

    const handleSelectLevelOnLobby = useCallback((levelId: number) => {
        setState((prev) => ({
            ...prev,
            you: {
                ...prev.you,
                level: levelId,
                isReady: false,
            },
        }));
        socketController.current?.emit([
            SocketEventLobby.SELECT_LEVEL,
            levelId,
        ]);
    }, []);

    const handleSelectSideOnLobby = useCallback((side: Side) => {
        setState((prev) => ({
            ...prev,
            you: {
                ...prev.you,
                side,
                isReady: false,
            },
        }));
        socketController.current?.emit([SocketEventLobby.SELECT_SIDE, side]);
    }, []);

    const handleClickReadyToPlay = useCallback(() => {
        setState((prev) => ({
            ...prev,
            you: {
                ...prev.you,
                isReady: !state.you.isReady,
            },
        }));
        socketController.current?.emit([
            SocketEventLobby.READY_TO_PLAY,
            !state.you.isReady,
        ]);
    }, [state]);

    const handleReceiveReadyToPlay = useCallback((data: boolean) => {
        console.log('receive team mate ready to play', data);
        setState((prev) => ({
            ...prev,
            mate: {
                ...prev.mate!,
                isReady: data,
            },
        }));
    }, []);

    const handleTeamMateJoinLobby = useCallback(
        (data: FriendJoinLobbyPayload) => {
            setState((prev) => ({
                ...prev,
                mate: {
                    account: data.user,
                    isReady: false,
                    side: data.side,
                    level: data.level || levels[0].id,
                },
                mateDisconnected: false,
                shouldDisplayQueueInfo: false,
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
            mate: undefined,
            mateDisconnected: true,
        }));
        handleDestroyConnection();
    }, [handleDestroyConnection]);

    const handleGameStart = useCallback((initialGameState: GameState) => {
        const apiClient = servicesContainer.get(ApiClient);
        Promise.all([
            apiClient.defaultApi.levelsControllerFindOne({
                id: String(initialGameState.level.id),
            }),
            startLoadingAssets(),
        ]).then(([level]) => {
            setState((prev) => ({
                ...prev,
                gameState: initialGameState,
                loadedLevel: level,
            }));
            setGameIsPlaying(true);
        });
    }, []);

    const handleGameFinished = useCallback(() => {
        setState((prev) => {
            const next = {
                ...prev,
                gameState: undefined,
                mate: {
                    ...prev.mate!,
                    side: undefined,
                    isReady: false,
                },
                isInQueue: false,
                shouldDisplayQueueInfo: false,
            };

            return next;
        });
        setGameIsPlaying(false);
        setMenuScene(MenuScene.END_LEVEL);
    }, [setMenuScene]);

    const handleReceiveLevelOnLobby = useCallback((levelId: number) => {
        setState((prev) => ({
            ...prev,
            mate: {
                ...prev.mate!,
                level: levelId,
                isReady: false,
            },
        }));
    }, []);

    const handleReceiveSideOnLobby = useCallback((side: Side) => {
        setState((prev) => {
            const next = {
                ...prev,
                mate: {
                    ...prev.mate!,
                    side,
                    isReady: false,
                },
            };
            return next;
        });
    }, []);

    const establishConnection = useCallback(async () => {
        if (socketController.current?.isConnected) {
            return;
        }
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
                    handleReceiveReadyToPlay,
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
        handleReceiveReadyToPlay,
    ]);

    // callback when the invited user is joining the lobby
    const handleEnterTeamLobby = useCallback(
        (inviteFriendToken: string) => {
            if (socketController.current) {
                return;
            }
            establishConnection().then(() => {
                socketController.current?.emit([
                    SocketEventLobby.FRIEND_JOIN_LOBBY,
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
                    SocketEventLobby.INVITE_FRIEND_TOKEN,
                    (data: InviteFriendTokenPayload) => {
                        resolve(
                            `${process.env.NEXT_PUBLIC_URL}/lobby?token=${data.token}`,
                        );
                        // clean up listener
                        socketController.current?.socket.removeAllListeners(
                            SocketEventLobby.INVITE_FRIEND_TOKEN,
                        );
                    },
                );
                // emit request
                socketController.current?.emit([
                    SocketEventLobby.CREATE_LOBBY,
                    {
                        userId: currentUser?.id || undefined,
                        side: state.you.side,
                        level: state.you.level,
                    } as CreateLobbyPayload,
                ]);
            });
        });
    }, [establishConnection, currentUser, state]);

    const handleExitRandomQueue = useCallback(() => {
        socketController.current?.destroy();
        setState((prev) => ({ ...prev, isInQueue: false }));
    }, []);

    const handleEnterRandomQueue = useCallback(() => {
        establishConnection().then(() => {
            // if already in queue, do nothing
            if (state.isInQueue) {
                return;
            }
            socketController.current?.emit([
                SocketEventLobby.JOIN_RANDOM_QUEUE,
                {
                    userId: currentUser?.id || undefined,
                    side: state.you.side,
                    level: state.you.level,
                },
            ]);
            setState((prev) => ({ ...prev, isInQueue: true }));
        });
    }, [establishConnection, state, currentUser?.id]);

    const exitLobby = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        socketController.current?.destroy();
        router.push(Route.HOME);
        goToStep({ step: MenuScene.HOME }, () => {
            setMenuScene(MenuScene.HOME);
            setState((prev) => ({
                ...prev,
                mate: undefined,
                mateDisconnected: false,
                shouldDisplayQueueInfo: true,
                you: {
                    isReady: false,
                    level: undefined,
                    side: undefined,
                    account: currentUser || undefined,
                },
            }));
        });
    }, [setMenuScene, onTransition, currentUser, goToStep, router]);

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

    const handleClickPlay = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        router.push(Route.LOBBY);
        goToStep({ step: MenuScene.TEAM_LOBBY });
    }, [goToStep, onTransition, router]);

    const handleClickPlayAgain = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        goToStep({ step: MenuScene.TEAM_LOBBY, side: undefined }, () => {
            setState((prev) => ({
                ...prev,
                you: {
                    ...prev.you,
                    side: undefined,
                },
                mate: prev.mate
                    ? {
                          ...prev.mate,
                      }
                    : undefined,
            }));
        });
    }, [goToStep, onTransition, setState]);

    const queueInfoInterval = useRef<NodeJS.Timeout>();
    const fetchCompletionInterval = useRef<NodeJS.Timeout>();
    const [allQueueInfo, setAllQueueInfo] = useState<AllQueueInfo>();
    const [fetchTime, setFetchTime] = useState(0);

    const fetchQueueInfo = useCallback(async () => {
        const apiClient = servicesContainer.get(ApiClient);
        return apiClient.defaultApi.appControllerGetQueueInfo().then((data) => {
            // clear previous interval
            clearInterval(queueInfoInterval.current);
            clearInterval(fetchCompletionInterval.current);
            const intervalId = setInterval(() => {
                // console.log('fetch');
                fetchQueueInfo();
            }, QUEUE_INFO_FETCH_INTERVAL);

            const completionIntervalId = setInterval(() => {
                // console.log('time update');
                setFetchTime((prev) => prev + 1000);
            }, 1000);

            setFetchTime(0);
            fetchCompletionInterval.current = completionIntervalId;
            queueInfoInterval.current = intervalId;
            setAllQueueInfo(data as AllQueueInfo);
            setState((prev) => ({
                ...prev,
                shouldDisplayQueueInfo: true,
            }));
        });
    }, [setState]);

    useEffect(() => {
        if (
            menuScene === MenuScene.TEAM_LOBBY &&
            state.shouldDisplayQueueInfo
        ) {
            fetchQueueInfo();
        }
        return () => {
            clearInterval(queueInfoInterval.current);
            clearInterval(fetchCompletionInterval.current);
            queueInfoInterval.current = undefined;
            fetchCompletionInterval.current = undefined;
        };
    }, [menuScene, state.shouldDisplayQueueInfo, fetchQueueInfo]);

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
        gameIsPlaying,
        levels,
        allQueueInfo,
        fetchTime,
        exitLobby,
        setState,
        handleClickReadyToPlay,
        handleGameStart,
        establishConnection,
        handleClickFindAnotherTeamMate,
        handleInviteFriend,
        handleEnterTeamLobby,
        handleClickPlay,
        handleEnterRandomQueue,
        handleExitRandomQueue,
        handleSelectLevelOnLobby,
        handleSelectSideOnLobby,
        handleClickHome,
        handleClickPlayAgain,
        fetchQueueInfo,
    };
}
