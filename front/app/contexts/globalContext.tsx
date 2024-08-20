'use client';
// vendors
import {
    useCallback,
    useContext,
    useState,
    createContext,
    useEffect,
} from 'react';
import { GameMode, LobbyParameters } from '../core/entities';
import { startLoadingAssets } from '../Game/assetsLoader';
import { servicesContainer } from '../core/frameworks';
import { CoreApiClient } from '../core/services';
import {
    createInitialGameStateAndLevelMapping,
    GameFinishedPayload,
    GameState,
    SocketEventLobby,
} from '@benjaminbours/composite-core';
import { exitFullScreen, requestFullScreen } from '../utils/game';
import { Level } from '@benjaminbours/composite-core-api-client';
import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import {
    ConnectionInfoV2,
    Region,
    RoomReadyStatus,
} from '@hathora/cloud-sdk-typescript/models/components';
import type { SocketController } from '../SocketController';
import { useMenuTransitionContext } from './menuTransitionContext';
import { MenuScene } from '../types';
import { waitUntilConditionMet } from '../utils/time';
import type Game from '../Game/Game';
import React from 'react';

// export interface PlayerState {
//     side: Side | undefined;
//     level: number | undefined;
//     isReady: boolean;
//     account: User | undefined;
// }

export enum GameStatus {
    LOADING_LEVEL_DATA = 'LOADING_LEVEL_DATA',
    // Creating a game in the selected region
    CREATING_GAME = 'CREATING_GAME',
    // Waiting for it to be ready
    CONNECTING_TO_GAME = 'CONNECTING_TO_GAME',
}

enum LoadingState {
    LOADING,
    PENDING,
    DONE,
}

export const statusTextMap = {
    [GameStatus.LOADING_LEVEL_DATA]: 'Building level map...',
    [GameStatus.CREATING_GAME]: 'Launching a game in your region...',
    [GameStatus.CONNECTING_TO_GAME]: 'Establishing connection...',
};

export interface FlowItem {
    id: GameStatus;
    text: string;
}

export const PRACTICE_FLOW: FlowItem[] = [
    {
        id: GameStatus.LOADING_LEVEL_DATA,
        text: statusTextMap[GameStatus.LOADING_LEVEL_DATA],
    },
];

export const RANKED_SOLO: FlowItem[] = [
    {
        id: GameStatus.LOADING_LEVEL_DATA,
        text: statusTextMap[GameStatus.LOADING_LEVEL_DATA],
    },
    {
        id: GameStatus.CREATING_GAME,
        text: statusTextMap[GameStatus.CREATING_GAME],
    },
    {
        id: GameStatus.CONNECTING_TO_GAME,
        text: statusTextMap[GameStatus.CONNECTING_TO_GAME],
    },
];

export interface GameData {
    initialGameState: GameState;
    lobbyParameters: LobbyParameters;
    level: Level;
    socketController?: SocketController;
    onGameRendered: () => void;
    onPracticeGameFinished?: (data: GameFinishedPayload) => void;
}

interface GlobalContext {
    // properties
    gameData: GameData | undefined;
    gameStats: GameFinishedPayload | undefined;
    isMenuVisible: boolean;
    isGameVisible: boolean;
    loadingFlow: FlowItem[];
    loadingStep: number;
    // actions
    createGame: (params: LobbyParameters) => void;
    exitGame: () => void;
    exitLobby: () => void;
    // components
    GameComponent: React.LazyExoticComponent<typeof Game> | undefined;
}

export const GlobalContext = createContext<GlobalContext>({} as GlobalContext);

export function useGameController() {
    const [GameComponent, setGameComponent] = useState<
        React.LazyExoticComponent<typeof Game> | undefined
    >(undefined);
    const [gameData, setGameData] = useState<GameData | undefined>(undefined);
    const [gameStats, setGameStats] = useState<GameFinishedPayload | undefined>(
        undefined,
    );
    const [loadingFlow, setLoadingFlow] = useState<FlowItem[]>([]);
    const [loadingStep, setLoadingStep] = useState(0);
    const [isMenuVisible, setIsMenuVisible] = useState(true);
    const [isGameVisible, setIsGameVisible] = useState(false);

    const { goToHome, setMenuScene, menuOut, menuIn } =
        useMenuTransitionContext();

    const fetchLevelData = useCallback((levelId: number) => {
        const apiClient = servicesContainer.get(CoreApiClient);
        return Promise.all([
            apiClient.defaultApi.levelsControllerFindOne({
                id: String(levelId),
            }),
            React.lazy(() => import('../Game')),
            startLoadingAssets(),
        ]).then(([level, Game]) => [level, Game] as const);
    }, []);

    const onGameRendered = useCallback(() => {
        menuOut(() => {
            setIsMenuVisible(false);
            setLoadingFlow([]);
        });
    }, [menuOut]);

    const handleGameStart = useCallback(
        (params: LobbyParameters, level: Level) =>
            (
                socketController: SocketController,
                initialGameState: GameState,
            ) => {
                // if (process.env.NEXT_PUBLIC_STAGE !== 'local') {
                //     (window as any).gtag('event', 'start_game', {
                //         env: process.env.NEXT_PUBLIC_STAGE,
                //         gameMode: lobbyMode,
                //         userId: currentUser?.id,
                //     });
                // }
                setGameData({
                    initialGameState,
                    level,
                    lobbyParameters: params,
                    onGameRendered,
                    socketController,
                });
                setIsGameVisible(true);
                // requestFullScreen();
            },
        [onGameRendered],
    );

    const handleGameFinished = useCallback(
        (data: GameFinishedPayload) => {
            // setState((prev) => {
            //     const next = {
            //         ...prev,
            //         gameState: undefined,
            //         lastGame: data,
            //         you: {
            //             ...prev.you,
            //             isReady: false,
            //         },
            //         mate: prev.mate
            //             ? {
            //                   ...prev.mate!,
            //                   side: undefined,
            //                   isReady: false,
            //               }
            //             : undefined,
            //         isInQueue: false,
            //         isWaitingForFriend: false,
            //     };

            //     return next;
            // });
            setIsMenuVisible(true);
            setGameStats(data);
            setMenuScene(MenuScene.END_LEVEL);
            exitFullScreen();
        },
        [setMenuScene],
    );

    const createSocketController = useCallback(
        async (uri: string, params: LobbyParameters, level: Level) => {
            return import('../SocketController')
                .then((mod) => mod.SocketController)
                .then((SocketController) => {
                    return new SocketController(
                        uri,
                        handleGameStart(params, level),
                        handleGameFinished,
                        () => {},
                        // handleTeamMateDisconnect,
                        () => {},
                        // handleTeamMateJoinLobby,
                        () => {},
                        // handleReceiveLevelOnLobby,
                        () => {},
                        // handleReceiveSideOnLobby,
                        () => {},
                        // handleReceiveReadyToPlay,
                    );
                });
        },
        [
            handleGameStart,
            handleGameFinished,
            // handleGameFinished,
            // handleTeamMateDisconnect,
            // // handleTeamMateJoinLobby,
            // handleReceiveLevelOnLobby,
            // handleReceiveSideOnLobby,
            // handleReceiveReadyToPlay,
        ],
    );

    const createGame = useCallback(
        async (params: LobbyParameters) => {
            const { region, levelId, visibility, playerNumber, mode } = params;

            // validations
            if (!levelId) {
                throw new Error('Level ID is not set');
            }

            if (mode !== GameMode.PRACTICE && region === '') {
                throw new Error('Region is not set');
            }

            const loadingFlow = (() => {
                if (mode === GameMode.PRACTICE) {
                    return PRACTICE_FLOW;
                }

                return RANKED_SOLO;
            })();
            setLoadingFlow(loadingFlow);
            setLoadingStep(0);

            const [level, Game] = await fetchLevelData(levelId).catch(
                (error) => {
                    console.error('Error fetching level data', error);
                    throw error;
                },
            );

            // if game component is not loaded, load it
            if (!GameComponent) {
                setGameComponent(Game);
            }
            // if practice mode, start game on the client side only
            if (mode === GameMode.PRACTICE) {
                const { initialGameState } =
                    createInitialGameStateAndLevelMapping(level);
                setGameData({
                    initialGameState,
                    level,
                    lobbyParameters: params,
                    onPracticeGameFinished: handleGameFinished,
                    onGameRendered,
                });
                setIsGameVisible(true);
                // requestFullScreen();
                return;
            }

            const hathoraCloud = new HathoraCloud({
                appId: process.env.NEXT_PUBLIC_HATHORA_APP_ID,
            });

            /**
             * Return the already existing token or fetch a new one
             * @returns Hathora token for anonymous user
             */
            const loginAsAnonymous = async () => {
                // if (hathoraAnonymousToken) {
                //     return hathoraAnonymousToken;
                // }
                return hathoraCloud.authV1
                    .loginAnonymous(process.env.NEXT_PUBLIC_HATHORA_APP_ID)
                    .then((res) => {
                        // actions.setHathoraAnonymousToken(res.token);
                        return res.token;
                    });
            };

            const connectToRoom = async (connectionInfo: ConnectionInfoV2) => {
                const uri = `wss://${connectionInfo.exposedPort!.host}:${connectionInfo.exposedPort!.port}`;
                const socketController = await createSocketController(
                    uri,
                    params,
                    level,
                );

                // const isSocketConnected = async (): Promise<{
                //     conditionMet: boolean;
                //     data: undefined;
                // }> => ({
                //     conditionMet: socketController.isConnected,
                //     data: undefined,
                // });

                // await waitUntilConditionMet(() => isSocketConnected());
                // console.log('socket is connected');

                const isDesktop =
                    window.innerWidth > 768 && window.innerHeight > 500;
                socketController.emit([
                    SocketEventLobby.START_SOLO_GAME,
                    {
                        // userId: currentUser?.id,
                        userId: undefined,
                        level: levelId,
                        device: isDesktop ? 'desktop' : 'mobile',
                        region,
                        roomId: connectionInfo.roomId,
                    },
                ]);
            };

            setLoadingStep((prev) => prev + 1);
            return loginAsAnonymous()
                .then((token) =>
                    hathoraCloud.lobbiesV3.createLobby(
                        {
                            playerAuth: token,
                        },
                        {
                            region: region as Region,
                            visibility,
                            roomConfig: JSON.stringify({
                                playerNumber,
                                levelId,
                            }),
                        },
                        process.env.NEXT_PUBLIC_HATHORA_APP_ID,
                    ),
                )
                .then((lobbyInfo) => {
                    setLoadingStep((prev) => prev + 1);
                    const isRoomReady = async (
                        roomId: string,
                    ): Promise<{
                        conditionMet: boolean;
                        data: ConnectionInfoV2;
                    }> => {
                        const connectionInfo =
                            await hathoraCloud.roomsV2.getConnectionInfo(
                                roomId,
                            );
                        return {
                            conditionMet:
                                connectionInfo.status ===
                                RoomReadyStatus.Active,
                            data: connectionInfo,
                        };
                    };

                    return waitUntilConditionMet(() =>
                        isRoomReady(lobbyInfo.roomId),
                    );
                })
                .then(connectToRoom);
        },
        [
            fetchLevelData,
            handleGameFinished,
            createSocketController,
            onGameRendered,
            GameComponent,
        ],
    );

    const exitGame = useCallback(() => {
        setMenuScene(MenuScene.TEAM_LOBBY);
        setIsMenuVisible(true);
        exitFullScreen();
    }, [setMenuScene]);

    const exitLobby = useCallback(() => {
        if (gameData?.socketController) {
            gameData.socketController.destroy();
        }
        goToHome();
        setGameData(undefined);
        setGameStats(undefined);
    }, [goToHome, gameData]);

    useEffect(() => {
        if (isMenuVisible) {
            menuIn(() => {
                setIsGameVisible(false);
            });
        }
    }, [isMenuVisible, menuIn]);

    return {
        gameData,
        gameStats,
        loadingFlow,
        loadingStep,
        isGameVisible,
        isMenuVisible,
        createGame,
        exitGame,
        exitLobby,
        GameComponent,
    };
}

interface GlobalContextProviderProps {
    children: React.ReactNode;
}

export const GlobalContextProvider: React.FC<GlobalContextProviderProps> = ({
    children,
}) => {
    return (
        <GlobalContext.Provider value={useGameController()}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = (): GlobalContext => useContext(GlobalContext);
