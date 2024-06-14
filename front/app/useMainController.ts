import {
    CreateLobbyPayload,
    FriendJoinLobbyPayload,
    GameFinishedPayload,
    GameState,
    InviteFriendTokenPayload,
    LevelMapping,
    MovableComponentState,
    Side,
    SocketEventLobby,
    gridSize,
} from '@benjaminbours/composite-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuScene, Route } from './types';
import { SocketController } from './SocketController';
import { useRouter, useSearchParams } from 'next/navigation';
import { servicesContainer } from './core/frameworks';
import { ApiClient } from './core/services';
import {
    Level,
    LevelStatusEnum,
    UpsertRatingDtoTypeEnum,
    User,
} from '@benjaminbours/composite-api-client';
import { useSnackbar } from 'notistack';
import { useStoreActions, useStoreState } from './hooks';
import { startLoadingAssets } from './Game/assetsLoader';
import { useMenuTransition } from './useMenuTransition';
import { Vector3 } from 'three';
import { computeRatings } from './utils';

export interface PlayerState {
    side: Side | undefined;
    level: number | undefined;
    isReady: boolean;
    account: User | undefined;
}

export interface MainState {
    isWaitingForFriend: boolean;
    isInQueue: boolean;
    lastGameDuration: number;
    gameState: GameState | undefined;
    loadedLevel: Level | undefined;
    you: PlayerState;
    mate: PlayerState | undefined;
    mateDisconnected: boolean;
}

export interface ServerCounts {
    playing: number;
    matchmaking: number;
    levels: Record<
        number,
        { playing: number; light_queue: number; shadow_queue: number }
    >;
}

export const QUEUE_INFO_FETCH_INTERVAL = 20000;

export enum LobbyMode {
    PRACTICE,
    SOLO,
    DUO_WITH_FRIEND,
    DUO_WITH_RANDOM,
}

export function useMainController(initialScene: MenuScene | undefined) {
    const {
        setMenuScene,
        goToStep,
        moveSideElementToCoordinate,
        sideElementToStep,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        onTransition,
        nextMenuScene,
        menuScene,
        refHashMap,
    } = useMenuTransition(initialScene);

    const fetchServerInfo = useStoreActions(
        (actions) => actions.serverInfo.fetchServerInfo,
    );
    const clearFetchServerInfo = useStoreActions(
        (actions) => actions.serverInfo.clearFetchServerInfo,
    );

    const { enqueueSnackbar } = useSnackbar();
    const currentUser = useStoreState((state) => state.user.currentUser);
    const queryParams = useSearchParams();
    const router = useRouter();
    const socketController = useRef<SocketController>();
    const [lobbyMode, setLobbyMode] = useState(LobbyMode.PRACTICE);

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

            const param = queryParams.get('dev_state');
            if (param) {
                const parts = param.split(',').map((str) => Number(str));
                side = parts[0] as Side;
                selectedLevel = parts[1];
            }

            return {
                isWaitingForFriend: false,
                gameState: undefined,
                loadedLevel: undefined,
                lastGameDuration: 0,
                you: {
                    side,
                    level: selectedLevel,
                    isReady: false,
                    account: undefined,
                },
                mate: undefined,
                mateDisconnected: false,
                isInQueue: false,
            };
        }

        return {
            isWaitingForFriend: false,
            gameState: undefined,
            loadedLevel: undefined,
            lastGameDuration: 0,
            you: {
                side: undefined,
                level: undefined,
                isReady: false,
                account: undefined,
            },
            mate: undefined,
            mateDisconnected: false,
            isInQueue: false,
        };
    });

    // TODO: These local states trigger refresh on component that are not related at all.
    // Fix this, try to extract it to a separate state / component
    const [levels, setLevels] = useState<Level[]>([]);
    const [gameIsPlaying, setGameIsPlaying] = useState(false);

    // responsible to fetch the levels
    useEffect(() => {
        const apiClient = servicesContainer.get(ApiClient);
        apiClient.defaultApi
            .levelsControllerFindAll({
                status: LevelStatusEnum.Published,
                stats: 'true',
            })
            .then((levels) => {
                setLevels(
                    levels
                        .map((level) => {
                            const ratings = computeRatings(level);
                            const qualityRating = ratings.find(
                                (rating) =>
                                    rating.type ===
                                    UpsertRatingDtoTypeEnum.Quality,
                            );
                            const difficultyRating = ratings.find(
                                (rating) =>
                                    rating.type ===
                                    UpsertRatingDtoTypeEnum.Difficulty,
                            );
                            return {
                                ...level,
                                qualityRating: qualityRating
                                    ? qualityRating.total / qualityRating.length
                                    : 0,
                                difficultyRating: difficultyRating
                                    ? difficultyRating.total /
                                      difficultyRating.length
                                    : 0,
                            };
                        })
                        .sort((a, b) => {
                            return a.difficultyRating - b.difficultyRating;
                        }),
                );
            });
    }, []);

    const handleClickFindAnotherTeamMate = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        socketController.current?.destroy();
        setGameIsPlaying(false);
        goToStep({ step: MenuScene.TEAM_LOBBY }, () => {
            router.push(Route.LOBBY);
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
                isWaitingForFriend: false,
            }));
        });
    }, [router, setMenuScene, currentUser, goToStep, onTransition]);

    const handleDestroyConnection = useCallback(() => {
        socketController.current?.destroy();
        socketController.current = undefined;
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
                    level: data.level,
                },
                mateDisconnected: false,
                isInQueue: false,
                isWaitingForFriend: false,
            }));
            setLobbyMode(LobbyMode.DUO_WITH_FRIEND);
            enqueueSnackbar('Your friend successfully joined the lobby', {
                variant: 'success',
            });
        },
        [enqueueSnackbar],
    );

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
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
    }, []);

    const handleGameFinished = useCallback(
        (data: GameFinishedPayload) => {
            setState((prev) => {
                const next = {
                    ...prev,
                    gameState: undefined,
                    lastGameDuration: data.duration,
                    you: {
                        ...prev.you,
                        isReady: false,
                    },
                    mate: prev.mate
                        ? {
                              ...prev.mate!,
                              side: undefined,
                              isReady: false,
                          }
                        : undefined,
                    isInQueue: false,
                    isWaitingForFriend: false,
                };

                return next;
            });
            setGameIsPlaying(false);
            setMenuScene(MenuScene.END_LEVEL);
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        },
        [setMenuScene],
    );

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

    const handleReceiveSideOnLobby = useCallback((side: Side | undefined) => {
        setState((prev) => {
            const next = {
                ...prev,
                mate: {
                    ...prev.mate!,
                    side: side,
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
            router.push(Route.LOBBY);
        },
        [establishConnection, enqueueSnackbar, currentUser, router],
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

                setState((prev) => ({ ...prev, isWaitingForFriend: true }));
            });
        });
    }, [establishConnection, currentUser, state]);

    const handleEnterRandomQueue = useCallback(
        (side: Side, level: number) => {
            socketController.current?.destroy();
            establishConnection().then(() => {
                socketController.current?.emit([
                    SocketEventLobby.JOIN_RANDOM_QUEUE,
                    {
                        userId: currentUser?.id || undefined,
                        side,
                        level,
                    },
                ]);
                setState((prev) => ({ ...prev, isInQueue: true }));
                fetchServerInfo();
            });
        },
        [establishConnection, fetchServerInfo, currentUser?.id],
    );

    const exitLobby = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        socketController.current?.destroy();
        goToStep({ step: MenuScene.HOME }, () => {
            router.push(Route.HOME);
            setMenuScene(MenuScene.HOME);
            setState((prev) => ({
                ...prev,
                mate: undefined,
                mateDisconnected: false,
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

    const handleClickPlay = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        fetchServerInfo();
        router.push(Route.LOBBY);
        goToStep({ step: MenuScene.TEAM_LOBBY });
    }, [goToStep, fetchServerInfo, onTransition, router]);

    const handleMouseEnterSideButton = useCallback(
        (side: Side) => (e: React.MouseEvent) => {
            const yingYang =
                e.currentTarget.parentElement?.querySelector('.ying-yang');
            if (!yingYang) {
                return;
            }

            if (side === Side.LIGHT) {
                const ying = yingYang.querySelector<SVGPathElement>('.white');
                if (ying) {
                    ying.classList.add('visible');
                }
                moveSideElementToCoordinate(
                    Side.LIGHT,
                    0.25 * window.innerWidth,
                    0.75 * window.innerHeight,
                );
                setLightIsPulsingFast(true);
            } else {
                const yang = yingYang.querySelector<SVGPathElement>('.black');
                if (yang) {
                    yang.classList.add('visible');
                }
                moveSideElementToCoordinate(
                    Side.SHADOW,
                    0.75 * window.innerWidth,
                    0.75 * window.innerHeight,
                );
                setShadowRotationSpeed(0.02);
            }
        },
        [
            setShadowRotationSpeed,
            setLightIsPulsingFast,
            moveSideElementToCoordinate,
        ],
    );

    const handleMouseLeaveSideButton = useCallback(
        (side: Side) => (e: React.MouseEvent) => {
            const yingYang =
                e.currentTarget.parentElement?.querySelector('.ying-yang');
            if (!yingYang) {
                return;
            }

            if (side === Side.LIGHT) {
                const ying = yingYang.querySelector<SVGPathElement>('.white');
                if (ying) {
                    ying.classList.remove('visible');
                }
                setLightIsPulsingFast(false);
                sideElementToStep(
                    Side.LIGHT,
                    {
                        step:
                            state.you.side === side || state.mate?.side === side
                                ? MenuScene.TEAM_LOBBY_SELECTED
                                : MenuScene.TEAM_LOBBY,
                    },
                    false,
                );
            } else {
                const yang = yingYang.querySelector<SVGPathElement>('.black');
                if (yang) {
                    yang.classList.remove('visible');
                }
                setShadowRotationSpeed(0.005);
                sideElementToStep(
                    Side.SHADOW,
                    {
                        step:
                            state.you.side === side || state.mate?.side === side
                                ? MenuScene.TEAM_LOBBY_SELECTED
                                : MenuScene.TEAM_LOBBY,
                    },
                    false,
                );
            }
        },
        [
            sideElementToStep,
            state.you,
            state.mate,
            setShadowRotationSpeed,
            setLightIsPulsingFast,
        ],
    );

    const handleClickLevelItem = useCallback(
        (levelId: number) => (e: React.MouseEvent) => {
            const targetClassList = (e.target as HTMLElement).classList;
            let side: Side | undefined = undefined;
            if (targetClassList.contains('half-circle--light')) {
                side = Side.LIGHT;
            } else if (targetClassList.contains('half-circle--shadow')) {
                side = Side.SHADOW;
            }

            const isDesktop =
                window.innerWidth > 768 && window.innerHeight > 500;
            if (
                lobbyMode !== LobbyMode.SOLO &&
                lobbyMode !== LobbyMode.PRACTICE &&
                side === undefined &&
                isDesktop
            ) {
                return;
            }

            const yingYang =
                e.currentTarget.parentElement?.querySelector('.ying-yang');
            if (!yingYang) {
                return;
            }

            const ying = yingYang.querySelector<SVGPathElement>('.white');
            if (ying) {
                ying.classList.remove('visible');
            }
            const yang = yingYang.querySelector<SVGPathElement>('.black');
            if (yang) {
                yang.classList.remove('visible');
            }

            // graphic update
            if (side === Side.LIGHT) {
                setLightIsPulsingFast(false);
            } else {
                setShadowRotationSpeed(0.005);
            }

            // state update
            setState((prev) => ({
                ...prev,
                you: {
                    ...prev.you,
                    level: levelId,
                    side: side,
                    isReady: false,
                },
            }));

            // network update
            // TODO: Send in one batch
            socketController.current?.emit([
                SocketEventLobby.SELECT_LEVEL,
                levelId,
            ]);
            socketController.current?.emit([
                SocketEventLobby.SELECT_SIDE,
                side,
            ]);

            if (lobbyMode === LobbyMode.DUO_WITH_RANDOM && side !== undefined) {
                handleEnterRandomQueue(side, levelId);
            }
        },
        [
            lobbyMode,
            setShadowRotationSpeed,
            setLightIsPulsingFast,
            handleEnterRandomQueue,
        ],
    );

    const handleAlignWithTeamMate = useCallback(() => {
        if (!state.mate) {
            return;
        }

        const nextLevel = state.mate.level;
        let nextSide = (() => {
            if (state.mate.side === undefined || state.mate.side === null) {
                return undefined;
            } else {
                return state.mate.side === Side.LIGHT
                    ? Side.SHADOW
                    : Side.LIGHT;
            }
        })();
        setState((prev) => ({
            ...prev,
            you: {
                ...prev.you,
                level: nextLevel,
                side: nextSide,
            },
        }));
        socketController.current?.emit([
            SocketEventLobby.SELECT_LEVEL,
            nextLevel,
        ]);
        socketController.current?.emit([
            SocketEventLobby.SELECT_SIDE,
            nextSide,
        ]);
    }, [state.mate]);

    const handleChangeLobbyMode = useCallback(
        (mode: LobbyMode) => {
            setLobbyMode(mode);
            handleDestroyConnection();
            setState((prev) => ({
                ...prev,
                mate: undefined,
                mateDisconnected: false,
                you: {
                    isReady: false,
                    level: undefined,
                    side: undefined,
                    account: currentUser || undefined,
                },
                isInQueue: false,
                isWaitingForFriend: false,
            }));
            if (mode === LobbyMode.DUO_WITH_RANDOM) {
                fetchServerInfo();
            }
        },
        [handleDestroyConnection, fetchServerInfo, currentUser],
    );

    const handleStartSolo = useCallback(() => {
        const levelId = state.you.level;
        if (!levelId) {
            return;
        }

        if (lobbyMode === LobbyMode.SOLO) {
            establishConnection().then(() => {
                const isDesktop =
                    window.innerWidth > 768 && window.innerHeight > 500;
                socketController.current?.emit([
                    SocketEventLobby.START_SOLO_GAME,
                    {
                        userId: currentUser?.id,
                        level: levelId,
                        device: isDesktop ? 'desktop' : 'mobile',
                    },
                ]);
            });
        } else if (lobbyMode === LobbyMode.PRACTICE) {
            const apiClient = servicesContainer.get(ApiClient);
            Promise.all([
                apiClient.defaultApi.levelsControllerFindOne({
                    id: String(levelId),
                }),
                startLoadingAssets(),
            ]).then(([level]) => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                }
                const levelMapping = new LevelMapping(
                    level.id,
                    level.data as any[],
                    {
                        light: new Vector3(
                            level.lightStartPosition[0],
                            level.lightStartPosition[1] === 0
                                ? 0.08
                                : level.lightStartPosition[1],
                            level.lightStartPosition[2],
                        ).multiplyScalar(gridSize),
                        shadow: new Vector3(
                            level.shadowStartPosition[0],
                            level.shadowStartPosition[1] === 0
                                ? 0.08
                                : level.shadowStartPosition[1],
                            level.shadowStartPosition[2],
                        ).multiplyScalar(gridSize),
                    },
                );
                const initialGameState = new GameState(
                    [
                        {
                            position: {
                                x: levelMapping.startPosition.shadow.x,
                                y: levelMapping.startPosition.shadow.y,
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
                                x: levelMapping.startPosition.light.x,
                                y: levelMapping.startPosition.light.y,
                            },
                            velocity: {
                                x: 0,
                                y: 0,
                            },
                            state: MovableComponentState.inAir,
                            insideElementID: undefined,
                        },
                    ],
                    levelMapping.state,
                    0,
                    0,
                );
                setState((prev) => ({
                    ...prev,
                    gameState: initialGameState,
                    loadedLevel: level,
                }));
                setGameIsPlaying(true);
            });
        }
    }, [state.you, currentUser, lobbyMode, establishConnection]);

    const handleExitGame = useCallback(() => {
        handleDestroyConnection();
        handleClickFindAnotherTeamMate();
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }, [handleDestroyConnection, handleClickFindAnotherTeamMate]);

    // effect to update shadow and light graphic accordingly with lobby state
    useEffect(() => {
        if (menuScene !== MenuScene.TEAM_LOBBY) {
            return;
        }

        if (state.you.side === Side.LIGHT || state.mate?.side === Side.LIGHT) {
            sideElementToStep(
                Side.LIGHT,
                { step: MenuScene.TEAM_LOBBY_SELECTED },
                false,
            );
        } else {
            sideElementToStep(
                Side.LIGHT,
                { step: MenuScene.TEAM_LOBBY },
                false,
            );
        }

        if (
            state.you.side === Side.SHADOW ||
            state.mate?.side === Side.SHADOW
        ) {
            sideElementToStep(
                Side.SHADOW,
                { step: MenuScene.TEAM_LOBBY_SELECTED },
                false,
            );
        } else {
            sideElementToStep(
                Side.SHADOW,
                { step: MenuScene.TEAM_LOBBY },
                false,
            );
        }
    }, [sideElementToStep, state.mate, state.you, menuScene]);

    useEffect(() => {
        if (!gameIsPlaying) {
            fetchServerInfo();
        }
        return () => {
            clearFetchServerInfo();
        };
    }, [gameIsPlaying, fetchServerInfo, clearFetchServerInfo]);

    // TODO: add params side in the url as well or at a state level selected without any side yet
    useEffect(() => {
        const levelId = Number(queryParams.get('level'));

        if (levels.length === 0 || Number.isNaN(levelId) || levelId === 0) {
            return;
        }
        setState((prev) => ({
            ...prev,
            you: {
                ...prev.you,
                level: levelId,
            },
        }));
        socketController.current?.emit([
            SocketEventLobby.SELECT_LEVEL,
            levelId,
        ]);
    }, [levels, queryParams]);

    return {
        state,
        socketController,
        gameIsPlaying,
        levels,
        nextMenuScene,
        menuScene,
        refHashMap,
        lobbyMode,
        handleChangeLobbyMode,
        exitLobby,
        setMenuScene,
        setState,
        handleClickReadyToPlay,
        handleGameStart,
        establishConnection,
        handleClickFindAnotherTeamMate,
        handleInviteFriend,
        handleEnterTeamLobby,
        handleClickPlay,
        handleClickHome,
        handleClickPlayAgain,
        handleMouseLeaveSideButton,
        handleMouseEnterSideButton,
        handleClickLevelItem,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        handleAlignWithTeamMate,
        handleStartSolo,
        handleGameFinished,
        handleExitGame,
    };
}
