import {
    GameState,
    InviteFriendTokenPayload,
    Levels,
    MatchMakingPayload,
    MovableComponentState,
    Side,
    SocketEventTeamLobby,
    SocketEventType,
    TeammateInfoPayload,
    TheHighSpheresLevel,
} from '@benjaminbours/composite-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuMode, MenuScene, Route } from './types';
import { SocketController } from './SocketController';
import { TweenOptions } from './Menu/tweens';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Curve, { defaultWaveOptions } from './Menu/canvas/Curve';

export interface MainState {
    side: Side | undefined;
    selectedLevel: Levels | undefined;
    gameState: GameState | undefined;
    levelSelectedByTeamMate: Levels | undefined;
    sideSelectedByTeamMate: Side | undefined;
}

export function useMainController(
    menuScene: MenuScene,
    setMenuScene: React.Dispatch<React.SetStateAction<MenuScene>>,
    goToStep: (tweenOptions: TweenOptions, onComplete?: () => void) => void,
    lightToStep: (options: TweenOptions, isMobileDevice: boolean) => void,
    shadowToStep: (options: TweenOptions, isMobileDevice: boolean) => void,
    onTransition: React.MutableRefObject<boolean>,
) {
    const queryParams = useSearchParams();
    const router = useRouter();
    const path = usePathname();
    const socketController = useRef<SocketController>();

    const [state, setState] = useState<MainState>(() => {
        if (process.env.NEXT_PUBLIC_STAGE === 'development') {
            const devModePlayer = (() => {
                const param = queryParams.get('dev_player');
                if (param) {
                    return Number(param) as Side;
                }

                return undefined;
            })();
            return {
                side: devModePlayer,
                selectedLevel: Levels.LEARN_TO_FLY,
                gameState: undefined,
                levelSelectedByTeamMate: undefined,
                sideSelectedByTeamMate: undefined,
            };
        }
        return {
            side: undefined,
            selectedLevel: undefined,
            gameState: undefined,
            levelSelectedByTeamMate: undefined,
            sideSelectedByTeamMate: undefined,
        };
    });

    const [teamMateDisconnected, setTeamMateDisconnected] = useState(false);
    const [menuMode, setMenuMode] = useState<MenuMode>(MenuMode.DEFAULT);
    const [gameIsPlaying, setGameIsPlaying] = useState(false);
    const [teamMateInfo, setTeamMateInfo] = useState<TeammateInfoPayload>();
    const [inviteFriendToken, setInviteFriendToken] = useState<
        string | undefined
    >(undefined);

    // redirect
    useEffect(() => {
        if (path === Route.LOBBY && !inviteFriendToken) {
            router.push(Route.HOME);
        }
    }, [path, router, inviteFriendToken]);

    // lobby animation effect
    useEffect(() => {
        if (menuScene !== MenuScene.TEAM_LOBBY) {
            return;
        }

        const isMobile = window.innerWidth < 768;
        // curve
        if (state.selectedLevel === state.levelSelectedByTeamMate) {
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
            lightToStep({ step: MenuScene.HOME }, isMobile);
        }

        // shadow
        if (
            state.side === Side.SHADOW ||
            state.sideSelectedByTeamMate === Side.SHADOW
        ) {
            shadowToStep({ step: MenuScene.HOME }, isMobile);
        }
    }, [state, menuScene, lightToStep, shadowToStep]);

    const sendMatchMakingInfo = useCallback((payload: MatchMakingPayload) => {
        socketController.current?.emit([
            SocketEventType.MATCHMAKING_INFO,
            payload,
        ]);
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

    const handleClickFindAnotherTeamMate = useCallback(() => {
        router.push(Route.HOME);
        if (gameIsPlaying) {
            setGameIsPlaying(false);
            setMenuScene(MenuScene.HOME);
            setTeamMateDisconnected(false);
        } else {
            goToStep(
                {
                    step: MenuScene.HOME,
                    side: undefined,
                },
                () => {
                    setMenuScene(MenuScene.HOME);
                    setTeamMateDisconnected(false);
                },
            );
        }
    }, [router, gameIsPlaying, goToStep, setMenuScene]);

    const handleReceiveInviteFriendToken = useCallback(
        (data: InviteFriendTokenPayload) => {
            setInviteFriendToken(data.token);
        },
        [],
    );

    const handleSelectLevelOnLobby = useCallback((levelId: Levels) => {
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

    const handleJoinLobby = useCallback(() => {
        console.log('joined lobby');
        router.push(Route.LOBBY);
        setMenuMode(MenuMode.IN_TEAM);
        handleSelectLevelOnLobby(0);
        goToStep({ step: MenuScene.TEAM_LOBBY, side: undefined });
    }, [goToStep, router, handleSelectLevelOnLobby]);

    const handleDestroyConnection = useCallback(() => {
        socketController.current?.destroy();
        socketController.current = undefined;
        setMenuMode(MenuMode.DEFAULT);
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

    const handleGameStart = useCallback((initialGameState: GameState) => {
        setState((prev) => ({ ...prev, gameState: initialGameState }));
        setGameIsPlaying(true);
        setMenuMode(MenuMode.IN_TEAM);
    }, []);

    const handleGameFinished = useCallback(() => {
        setState((prev) => ({
            side: prev.side,
            selectedLevel: undefined,
            sideSelectedByTeamMate: undefined,
            levelSelectedByTeamMate: undefined,
            gameState: undefined,
        }));
        setGameIsPlaying(false);
        setMenuScene(MenuScene.END_LEVEL);
    }, [setMenuScene]);

    const handleTeamMateInfo = useCallback((data: TeammateInfoPayload) => {
        console.log('receive team mate info');
        setTeamMateInfo(data);
    }, []);

    const handleReceiveLevelOnLobby = useCallback((levelId: Levels) => {
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
                    handleTeamMateInfo,
                    handleReceiveInviteFriendToken,
                    handleJoinLobby,
                    handleReceiveLevelOnLobby,
                    handleReceiveSideOnLobby,
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
        handleReceiveLevelOnLobby,
        handleReceiveSideOnLobby,
    ]);

    const handleEnterTeamLobby = useCallback(
        (inviteFriendToken: string) => {
            if (socketController.current) {
                return;
            }
            setInviteFriendToken(inviteFriendToken);
            router.push(Route.LOBBY);
            setMenuScene(MenuScene.TEAM_LOBBY);
            setMenuMode(MenuMode.IN_TEAM);
            establishConnection().then(() => {
                socketController.current?.emit([
                    SocketEventType.FRIEND_JOIN_LOBBY,
                    inviteFriendToken,
                ]);
            });
        },
        [establishConnection, setMenuScene, router],
    );

    const handleClickPlayWithFriend = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        establishConnection().then(() => {
            socketController.current?.emit([
                SocketEventType.REQUEST_INVITE_FRIEND_TOKEN,
            ]);
        });
        goToStep({ step: MenuScene.INVITE_FRIEND, side: undefined });
    }, [establishConnection, onTransition, goToStep]);

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
        (levelId: Levels) => {
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
                        if (menuMode === MenuMode.DEFAULT) {
                            handleDestroyConnection();
                        }
                    },
                );
            },
        };
        // there is no back button on these scenes
        if (
            menuScene !== MenuScene.HOME &&
            menuScene !== MenuScene.END_LEVEL &&
            menuScene !== MenuScene.TEAM_LOBBY &&
            menuScene !== MenuScene.NOT_FOUND
        ) {
            backOptions[menuScene]();
        }
    }, [
        menuScene,
        state.side,
        handleDestroyConnection,
        menuMode,
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

    // development effect
    useEffect(() => {
        console.log(process.env.NEXT_PUBLIC_SOLO_MODE);

        if (process.env.NEXT_PUBLIC_SOLO_MODE) {
            establishConnection().then(() => {
                const level = new TheHighSpheresLevel();
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
            return () => {
                handleDestroyConnection();
            };
        }
        if (
            process.env.NEXT_PUBLIC_STAGE === 'development' &&
            state.side !== undefined &&
            socketController.current === undefined
        ) {
            console.log('enter random queue');
            handleEnterRandomQueue(state.side);
        }

        return () => {
            handleDestroyConnection();
        };
    }, []);

    return {
        state,
        socketController,
        inviteFriendToken,
        teamMateInfo,
        gameIsPlaying,
        menuMode,
        teamMateDisconnected,
        handleGameStart,
        establishConnection,
        sendMatchMakingInfo,
        handleClickOnJoinTeamMate,
        handleClickFindAnotherTeamMate,
        handleEnterTeamLobby,
        handleClickPlayWithFriend,
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
