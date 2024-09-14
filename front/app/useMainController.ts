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
    createInitialGameStateAndLevelMapping,
    gridSize,
} from '@benjaminbours/composite-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuScene, Route } from './types';
// import { SocketController } from './core/services/SocketController';
import { useRouter, useSearchParams } from 'next/navigation';
import { servicesContainer } from './core/frameworks';
import { CoreApiClient } from './core/services';
import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import {
    Level,
    LevelStatusEnum,
    UpsertRatingDtoTypeEnum,
    User,
} from '@benjaminbours/composite-core-api-client';
import { useSnackbar } from 'notistack';
import { useStoreActions, useStoreState } from './hooks';
import { Vector2, Vector3 } from 'three';
import {
    computeLevelRatings,
    exitFullScreen,
    requestFullScreen,
} from './utils/game';
import {
    ConnectionInfoV2,
    Region,
} from '@hathora/cloud-sdk-typescript/models/components';

export interface MainState {
    isWaitingForFriend: boolean;
    isInQueue: boolean;
    lastGame: { duration: number; rank: number };
    gameState: GameState | undefined;
    loadedLevel: Level | undefined;
    // you: PlayerState;
    // mate: PlayerState | undefined;
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

// export enum LobbyMode {
//     PRACTICE,
//     SOLO,
//     DUO_WITH_FRIEND,
//     DUO_WITH_RANDOM,
// }

export function useMainController() {
    // const {
    //     setMenuScene,
    //     // goToStep,
    //     onTransition,
    //     nextMenuScene,
    //     menuScene,

    //     // goToHome,
    //     // goToLobby,

    //     // refs
    //     canvasBlack,
    //     canvasWhite,
    //     homeRef,
    //     endLevelRef,
    //     teamLobbyRef,
    //     notFoundRef,
    // } = useMenuTransition(initialScene);

    const [hathoraAuthToken, setHathoraAuthToken] = useState<
        string | undefined
    >();
    const isEstablishingConnection = useRef(false);

    // const fetchServerInfo = useStoreActions(
    //     (actions) => actions.serverInfo.fetchServerInfo,
    // );
    // const clearFetchServerInfo = useStoreActions(
    //     (actions) => actions.serverInfo.clearFetchServerInfo,
    // );

    const { enqueueSnackbar } = useSnackbar();
    const currentUser = useStoreState((state) => state.user.currentUser);
    const queryParams = useSearchParams();
    const router = useRouter();
    // const socketController = useRef<SocketController>();
    // const [lobbyMode, setLobbyMode] = useState(LobbyMode.PRACTICE);

    useEffect(() => {
        setState((prev) => ({
            ...prev,
            // you: { ...prev.you, account: currentUser },
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
                lastGame: { duration: 0, rank: 0 },
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
            lastGame: { duration: 0, rank: 0 },
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
    const [gameIsPlaying, setGameIsPlaying] = useState(false);

    // const handleClickFindAnotherTeamMate = useCallback(() => {
    //     if (onTransition.current) {
    //         return;
    //     }
    //     socketController.current?.destroy();
    //     setGameIsPlaying(false);
    //     goToStep({ step: MenuScene.TEAM_LOBBY }, () => {
    //         router.push(Route.LOBBY);
    //         // TODO: I think this call is not necessary
    //         setMenuScene(MenuScene.TEAM_LOBBY);
    //         setState((prev) => ({
    //             ...prev,
    //             loadedLevel: undefined,
    //             mateDisconnected: false,
    //             you: {
    //                 isReady: false,
    //                 side: undefined,
    //                 level: undefined,
    //                 account: currentUser || undefined,
    //             },
    //             isInQueue: false,
    //             isWaitingForFriend: false,
    //         }));
    //     });
    // }, [router, setMenuScene, currentUser, goToStep, onTransition]);

    // const handleDestroyConnection = useCallback(() => {
    //     socketController.current?.destroy();
    //     socketController.current = undefined;
    // }, []);

    const handleClickReadyToPlay = useCallback(() => {
        // setState((prev) => ({
        //     ...prev,
        //     you: {
        //         ...prev.you,
        //         isReady: !state.you.isReady,
        //     },
        // }));
        // socketController.current?.emit([
        //     SocketEventLobby.READY_TO_PLAY,
        //     !state.you.isReady,
        // ]);
    }, [state]);

    const handleReceiveReadyToPlay = useCallback((data: boolean) => {
        console.log('receive team mate ready to play', data);
        // setState((prev) => ({
        //     ...prev,
        //     mate: {
        //         ...prev.mate!,
        //         isReady: data,
        //     },
        // }));
    }, []);

    // const handleTeamMateJoinLobby = useCallback(
    //     (data: FriendJoinLobbyPayload) => {
    //         setState((prev) => ({
    //             ...prev,
    //             mate: {
    //                 account: data.user,
    //                 isReady: false,
    //                 side: data.side,
    //                 level: data.level,
    //             },
    //             mateDisconnected: false,
    //             isInQueue: false,
    //             isWaitingForFriend: false,
    //         }));
    //         setLobbyMode(LobbyMode.DUO_WITH_FRIEND);
    //         enqueueSnackbar('Your friend successfully joined the lobby', {
    //             variant: 'success',
    //         });
    //         if (process.env.NEXT_PUBLIC_STAGE !== 'local') {
    //             (window as any).gtag('event', 'friend_join', {
    //                 env: process.env.NEXT_PUBLIC_STAGE,
    //                 userId: currentUser?.id,
    //             });
    //         }
    //     },
    //     [enqueueSnackbar, currentUser],
    // );

    const handleReceiveLevelOnLobby = useCallback((levelId: number) => {
        // setState((prev) => ({
        //     ...prev,
        //     mate: {
        //         ...prev.mate!,
        //         level: levelId,
        //         isReady: false,
        //     },
        // }));
    }, []);

    const handleReceiveSideOnLobby = useCallback((side: Side | undefined) => {
        // setState((prev) => {
        //     const next = {
        //         ...prev,
        //         mate: {
        //             ...prev.mate!,
        //             side: side,
        //             isReady: false,
        //         },
        //     };
        //     return next;
        // });
    }, []);

    // callback when the invited user is joining the lobby
    const handleEnterTeamLobby = useCallback((inviteFriendToken: string) => {
        // if (socketController.current) {
        //     return;
        // }
        // establishConnection().then(() => {
        //     socketController.current?.emit([
        //         SocketEventLobby.FRIEND_JOIN_LOBBY,
        //         {
        //             token: inviteFriendToken,
        //             user: currentUser,
        //         },
        //     ]);
        //     enqueueSnackbar('Successfully joined the lobby!', {
        //         variant: 'success',
        //     });
        // });
        // router.push(Route.LOBBY);
    }, []);

    const handleInviteFriend = useCallback(async (): Promise<string> => {
        if (process.env.NEXT_PUBLIC_STAGE !== 'local') {
            (window as any).gtag('event', 'invite_friend', {
                env: process.env.NEXT_PUBLIC_STAGE,
                userId: currentUser?.id,
            });
        }
        if (isEstablishingConnection.current) {
            return '';
        }
        isEstablishingConnection.current = true;

        return '';
        // return establishConnection().then(() => {
        //     return new Promise((resolve) => {
        //         // register listener before emitting
        //         socketController.current?.socket.on(
        //             SocketEventLobby.INVITE_FRIEND_TOKEN,
        //             (data: InviteFriendTokenPayload) => {
        //                 resolve(
        //                     `${process.env.NEXT_PUBLIC_URL}/lobby?token=${data.token}`,
        //                 );
        //                 // clean up listener
        //                 socketController.current?.socket.removeAllListeners(
        //                     SocketEventLobby.INVITE_FRIEND_TOKEN,
        //                 );
        //             },
        //         );
        //         // emit request
        //         socketController.current?.emit([
        //             SocketEventLobby.CREATE_LOBBY,
        //             {
        //                 userId: currentUser?.id || undefined,
        //                 side: state.you.side,
        //                 level: state.you.level,
        //             } as CreateLobbyPayload,
        //         ]);

        //         setState((prev) => ({ ...prev, isWaitingForFriend: true }));
        //         isEstablishingConnection.current = false;
        //     });
        // });
    }, [currentUser]);

    const handleEnterRandomQueue = useCallback((side: Side, level: number) => {
        // socketController.current?.destroy();
        // establishConnection().then(() => {
        //     socketController.current?.emit([
        //         SocketEventLobby.JOIN_RANDOM_QUEUE,
        //         {
        //             userId: currentUser?.id || undefined,
        //             side,
        //             level,
        //         },
        //     ]);
        //     setState((prev) => ({ ...prev, isInQueue: true }));
        //     fetchServerInfo();
        // });
    }, []);

    // const exitLobby = useCallback(() => {
    //     if (onTransition.current) {
    //         return;
    //     }
    //     socketController.current?.destroy();
    //     goToStep({ step: MenuScene.HOME }, () => {
    //         router.push(Route.HOME);
    //         setMenuScene(MenuScene.HOME);
    //         setState((prev) => ({
    //             ...prev,
    //             mate: undefined,
    //             mateDisconnected: false,
    //             you: {
    //                 isReady: false,
    //                 level: undefined,
    //                 side: undefined,
    //                 account: currentUser || undefined,
    //             },
    //         }));
    //     });
    // }, [setMenuScene, onTransition, currentUser, goToStep, router]);

    // const handleClickPlay = useCallback(() => {
    //     if (onTransition.current) {
    //         return;
    //     }
    //     // fetchServerInfo();
    //     router.push(Route.LOBBY);
    //     goToStep({ step: MenuScene.TEAM_LOBBY });
    // }, [goToStep, onTransition, router]);

    const handleAlignWithTeamMate = useCallback(() => {
        // if (!state.mate) {
        //     return;
        // }
        // const nextLevel = state.mate.level;
        // let nextSide = (() => {
        //     if (state.mate.side === undefined || state.mate.side === null) {
        //         return undefined;
        //     } else {
        //         return state.mate.side === Side.LIGHT
        //             ? Side.SHADOW
        //             : Side.LIGHT;
        //     }
        // })();
        // setState((prev) => ({
        //     ...prev,
        //     you: {
        //         ...prev.you,
        //         level: nextLevel,
        //         side: nextSide,
        //     },
        // }));
        // socketController.current?.emit([
        //     SocketEventLobby.SELECT_LEVEL,
        //     nextLevel,
        // ]);
        // socketController.current?.emit([
        //     SocketEventLobby.SELECT_SIDE,
        //     nextSide,
        // ]);
    }, [state]);

    // const handleChangeLobbyMode = useCallback(
    //     (mode: LobbyMode) => {
    //         setLobbyMode(mode);
    //         handleDestroyConnection();
    //         setState((prev) => ({
    //             ...prev,
    //             mate: undefined,
    //             mateDisconnected: false,
    //             you: {
    //                 isReady: false,
    //                 level: undefined,
    //                 side: undefined,
    //                 account: currentUser || undefined,
    //             },
    //             isInQueue: false,
    //             isWaitingForFriend: false,
    //         }));
    //         if (mode === LobbyMode.DUO_WITH_RANDOM) {
    //             // fetchServerInfo();
    //         }
    //     },
    //     [handleDestroyConnection, currentUser],
    // );

    // const handleCreateGame = useCallback(
    //     (createGameState: GameModelProperties) => {
    //         if (createGameState.levelId === undefined) {
    //             // TODO: improve the meaning of the error, highlight the level selection for example
    //             enqueueSnackbar('A level must be selected', {
    //                 variant: 'error',
    //             });
    //             return;
    //         }

    //         if (createGameState.mode === GameMode.PRACTICE) {
    //             fetchLevelData(createGameState.levelId).then((level) => {
    //                 requestFullScreen();
    //                 const { initialGameState } =
    //                     createInitialGameStateAndLevelMapping(level);
    //                 setState((prev) => ({
    //                     ...prev,
    //                     gameState: initialGameState,
    //                     loadedLevel: level,
    //                 }));
    //                 setGameIsPlaying(true);
    //             });
    //             return;
    //         }

    //         if (
    //             createGameState.mode === GameMode.RANKED &&
    //             createGameState.playerNumber === GamePlayerNumber.SOLO
    //         ) {
    //             if (createGameState.region === '') {
    //                 enqueueSnackbar('A region must be selected', {
    //                     variant: 'error',
    //                 });
    //                 return;
    //             }
    //             // handleStartSolo(createGameState.region);
    //         }
    //     },
    //     [enqueueSnackbar],
    // );

    // const handleStartSolo = useCallback(
    //     (selectedRegion: string | null) => {
    //         const levelId = state.you.level;
    //         if (!levelId) {
    //             return;
    //         }

    //         if (isEstablishingConnection.current) {
    //             return;
    //         }

    //         if (lobbyMode === LobbyMode.SOLO) {
    //             if (!selectedRegion) {
    //                 throw new Error('Selected region is not defined');
    //             }

    //             setIsLoadingSoloGame(true);
    //             isEstablishingConnection.current = true;

    //             // // if we are in local development, just connect to the local instance
    //             // if (process.env.NEXT_PUBLIC_STAGE === 'local') {
    //             //     const uri = `real-time-api.composite`;
    //             //     establishConnection(uri).then(() => {
    //             //         const isDesktop =
    //             //             window.innerWidth > 768 && window.innerHeight > 500;
    //             //         socketController.current?.emit([
    //             //             SocketEventLobby.START_SOLO_GAME,
    //             //             {
    //             //                 userId: currentUser?.id,
    //             //                 level: levelId,
    //             //                 device: isDesktop ? 'desktop' : 'mobile',
    //             //             },
    //             //         ]);
    //             //     });
    //             //     return;
    //             // }

    //             const apiClient = servicesContainer.get(CoreApiClient);

    //             // TODO: Store hathora auth token in the session
    //             loginAsAnonymous()
    //                 .then(createLobby)
    //                 .then((lobbyInfo) => {
    //                     console.log('HERE lobby created', lobbyInfo);
    //                     return waitUntilRoomIsReady(lobbyInfo.roomId);
    //                 })
    //                 .then(connectToRoom);

    //             // .then(waitUntilRoomIsReady)
    //             // .then(connectToRoom);
    //         } else if (lobbyMode === LobbyMode.PRACTICE) {
    //             console.log('HERE practice');

    //             // TODO: Should rather track game created and lobby joined
    //             // if (process.env.NEXT_PUBLIC_STAGE !== 'local') {
    //             //     (window as any).gtag('event', 'start_game', {
    //             //         env: process.env.NEXT_PUBLIC_STAGE,
    //             //         gameMode: lobbyMode,
    //             //         userId: currentUser?.id,
    //             //     });
    //             // }
    //         }
    //     },
    //     [
    //         state.you,
    //         currentUser,
    //         lobbyMode,
    //         establishConnection,
    //         hathoraAuthToken,
    //     ],
    // );

    // const handleExitGame = useCallback(() => {
    //     handleDestroyConnection();
    //     handleClickFindAnotherTeamMate();

    //     exitFullScreen();
    // }, [handleDestroyConnection, handleClickFindAnotherTeamMate]);

    // effect to update shadow and light graphic accordingly with lobby state
    // useEffect(() => {
    // if (menuScene !== MenuScene.TEAM_LOBBY) {
    //     return;
    // }
    // if (state.you.side === Side.LIGHT || state.mate?.side === Side.LIGHT) {
    //     sideElementToStep(
    //         Side.LIGHT,
    //         { step: MenuScene.TEAM_LOBBY_SELECTED },
    //         false,
    //     );
    // } else {
    //     sideElementToStep(
    //         Side.LIGHT,
    //         { step: MenuScene.TEAM_LOBBY },
    //         false,
    //     );
    // }
    // if (
    //     state.you.side === Side.SHADOW ||
    //     state.mate?.side === Side.SHADOW
    // ) {
    //     sideElementToStep(
    //         Side.SHADOW,
    //         { step: MenuScene.TEAM_LOBBY_SELECTED },
    //         false,
    //     );
    // } else {
    //     sideElementToStep(
    //         Side.SHADOW,
    //         { step: MenuScene.TEAM_LOBBY },
    //         false,
    //     );
    // }
    // }, [sideElementToStep, state, menuScene]);

    // useEffect(() => {
    //     if (!gameIsPlaying) {
    //         fetchServerInfo();
    //     }
    //     return () => {
    //         clearFetchServerInfo();
    //     };
    // }, [gameIsPlaying, fetchServerInfo, clearFetchServerInfo]);

    return {
        state,
        // socketController,
        gameIsPlaying,
        // handleChangeLobbyMode,
        // exitLobby,
        setState,
        handleClickReadyToPlay,
        // establishConnection,
        // handleClickFindAnotherTeamMate,
        handleInviteFriend,
        handleEnterTeamLobby,
        // handleClickPlay,
        // goToStep,
        handleAlignWithTeamMate,
        // handleExitGame,
    };
}
