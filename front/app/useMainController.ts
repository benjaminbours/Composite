import {
    GameState,
    InviteFriendTokenPayload,
    Levels,
    MatchMakingPayload,
    Side,
    SocketEventTeamLobby,
    SocketEventType,
    TeammateInfoPayload,
} from '@benjaminbours/composite-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MenuMode, MenuScene, Route } from './types';
import { MainState } from './MainApp';
import { SocketController } from './SocketController';
import { TweenOptions } from './Menu/tweens';
import { useRouter, usePathname } from 'next/navigation';

export function useMainController(
    menuScene: MenuScene,
    setMenuScene: React.Dispatch<React.SetStateAction<MenuScene>>,
    goToStep: (tweenOptions: TweenOptions, onComplete?: () => void) => void,
    onTransition: React.MutableRefObject<boolean>,
) {
    const router = useRouter();
    const path = usePathname();
    const socketController = useRef<SocketController>();

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

    const handleJoinLobby = useCallback(() => {
        console.log('joined lobby');
        router.push(Route.LOBBY);
        setMenuMode(MenuMode.IN_TEAM);
        goToStep({ step: MenuScene.TEAM_LOBBY, side: undefined });
    }, [goToStep, router]);

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
        setGameIsPlaying(false);
        setMenuScene(MenuScene.END_LEVEL);
    }, [setMenuScene]);

    const handleTeamMateInfo = useCallback((data: TeammateInfoPayload) => {
        console.log('receive team mate info');
        setTeamMateInfo(data);
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
            setState((prev) => ({ ...prev, side }));
            establishConnection().then(() =>
                sendMatchMakingInfo({
                    selectedLevel: state.selectedLevel!,
                    side,
                }),
            );
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
    };
}
