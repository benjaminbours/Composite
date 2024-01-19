// vendors
import { gsap } from 'gsap';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
// our libs
import {
    AllQueueInfo,
    Levels,
    Side,
    TeammateInfoPayload,
} from '@benjaminbours/composite-core';
// local
import CanvasBlack from './canvas/CanvasBlack';
import CanvasWhite from './canvas/CanvasWhite';
import Mouse from './canvas/Mouse';
import { MenuMode, MenuScene } from './types';
import { MainState } from '../MainApp';
import {
    QueueScene,
    SideScene,
    EndLevelScene,
    LevelScene,
    HomeScene,
    InviteFriendScene,
    TeamLobbyScene,
} from './scenes';
import { Actions } from './Actions';
import { TeamMateDisconnectNotification } from '../TeamMateDisconnectNotification';
import { goToStep } from './tweens';

interface Props {
    mainState: MainState;
    setMainState: React.Dispatch<React.SetStateAction<MainState>>;
    menuScene: MenuScene;
    nextMenuScene: MenuScene | undefined;
    mode: MenuMode;
    setMenuScene: React.Dispatch<React.SetStateAction<MenuScene>>;
    setNextMenuScene: React.Dispatch<
        React.SetStateAction<MenuScene | undefined>
    >;
    destroyConnection: () => void;
    teamMate: {
        info: TeammateInfoPayload | undefined;
        onJoin: () => void;
    };
    teamMateDisconnected: boolean;
    setTeamMateDisconnected: React.Dispatch<React.SetStateAction<boolean>>;
    stats: React.MutableRefObject<Stats | undefined>;
}

export function Menu({
    setMainState,
    mainState,
    menuScene,
    mode,
    setMenuScene,
    destroyConnection,
    teamMate,
    teamMateDisconnected,
    setTeamMateDisconnected,
    stats,
    setNextMenuScene,
    nextMenuScene,
}: Props) {
    const [allQueueInfo, setAllQueueInfo] = useState<AllQueueInfo>();
    const blackCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const whiteCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const blackCanvas = useRef<CanvasBlack>();
    const whiteCanvas = useRef<CanvasWhite>();
    const onTransition = useRef(false);
    const homeRef = useRef<HTMLDivElement>(null);
    const levelRef = useRef<HTMLDivElement>(null);
    const sideRef = useRef<HTMLDivElement>(null);
    const queueRef = useRef<HTMLDivElement>(null);
    const endLevelRef = useRef<HTMLDivElement>(null);
    const inviteFriendRef = useRef<HTMLDivElement>(null);
    const teamLobbyRef = useRef<HTMLDivElement>(null);

    const isMobileDevice = useMemo(() => {
        if (!window) {
            return true;
        }
        return window.innerWidth <= 768;
    }, []);

    const refHashMap = useMemo(
        () => ({
            canvasBlack: blackCanvas,
            canvasWhite: whiteCanvas,
            homeRef,
            levelRef,
            sideRef,
            queueRef,
            endLevelRef,
            inviteFriendRef,
            teamLobbyRef,
        }),
        [],
    );

    const resize = useCallback(() => {
        if (!blackCanvas.current || !whiteCanvas.current) {
            return;
        }
        blackCanvas.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            side: mainState.side,
        });
        whiteCanvas.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            side: mainState.side,
        });
    }, [isMobileDevice, menuScene, mainState.side]);

    const canvasLoop = useCallback(() => {
        stats.current?.begin();
        blackCanvas.current?.render();
        whiteCanvas.current?.render();
        stats.current?.end();
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // effect to start to render the menu animation
    useEffect(() => {
        blackCanvas.current = new CanvasBlack(
            blackCanvasDomElement.current as HTMLCanvasElement,
        );
        whiteCanvas.current = new CanvasWhite(
            whiteCanvasDomElement.current as HTMLCanvasElement,
        );
        Mouse.init();
        resize();
        gsap.ticker.add(canvasLoop);
        return () => {
            gsap.ticker.remove(canvasLoop);
            Mouse.destroy();
        };
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // effect to fetch queue info
    useEffect(() => {
        const fetchQueueInfo = () => {
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/queue-info`)
                .then((res) => res.json())
                .then((data: AllQueueInfo) => setAllQueueInfo(data));
        };
        fetchQueueInfo();
        const intervalId = setInterval(fetchQueueInfo, 2000);
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    // on resize
    useEffect(() => {
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [resize]);

    const handleClickOnRandom = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        // TODO: This should change, it make sens only on end level scene
        // if (teamMateDisconnected) {
        //     setTeamMateDisconnected(false);
        // }
        onTransition.current = true;
        setNextMenuScene(MenuScene.LEVEL);
        goToStep(
            refHashMap,
            { step: MenuScene.LEVEL, side: undefined, isMobileDevice },
            () => {
                onTransition.current = false;
                setMenuScene(MenuScene.LEVEL);
                setNextMenuScene(undefined);
            },
        );
    }, [
        // teamMateDisconnected,
        // setTeamMateDisconnected,
        isMobileDevice,
        refHashMap,
        setMenuScene,
        setNextMenuScene,
    ]);

    const handleClickOnFriend = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        onTransition.current = true;
        setNextMenuScene(MenuScene.INVITE_FRIEND);
        goToStep(
            refHashMap,
            { step: MenuScene.INVITE_FRIEND, side: undefined, isMobileDevice },
            () => {
                onTransition.current = false;
                setMenuScene(MenuScene.INVITE_FRIEND);
                setNextMenuScene(undefined);
            },
        );
    }, [isMobileDevice, refHashMap, setMenuScene, setNextMenuScene]);

    const handleClickOnQuitTeam = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        setNextMenuScene(MenuScene.HOME);
        goToStep(
            refHashMap,
            { step: MenuScene.HOME, side: undefined, isMobileDevice },
            () => {
                onTransition.current = false;
                setMenuScene(MenuScene.HOME);
                setNextMenuScene(undefined);
                destroyConnection();
            },
        );
    }, [
        isMobileDevice,
        refHashMap,
        setMenuScene,
        destroyConnection,
        setNextMenuScene,
    ]);

    const handleClickOnBack = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        const backOptions = {
            invite_friend() {
                setNextMenuScene(MenuScene.HOME);
                goToStep(
                    refHashMap,
                    { step: MenuScene.HOME, side: undefined, isMobileDevice },
                    () => {
                        onTransition.current = false;
                        setMenuScene(MenuScene.HOME);
                        setNextMenuScene(undefined);
                    },
                );
            },
            level() {
                setNextMenuScene(MenuScene.HOME);
                goToStep(
                    refHashMap,
                    { step: MenuScene.HOME, side: undefined, isMobileDevice },
                    () => {
                        onTransition.current = false;
                        setMenuScene(MenuScene.HOME);
                        setNextMenuScene(undefined);
                    },
                );
            },
            faction() {
                setNextMenuScene(MenuScene.LEVEL);
                goToStep(
                    refHashMap,
                    { step: MenuScene.LEVEL, side: undefined, isMobileDevice },
                    () => {
                        onTransition.current = false;
                        setMenuScene(MenuScene.LEVEL);
                        setNextMenuScene(undefined);
                    },
                );
            },
            queue() {
                MenuScene.FACTION;
                setMenuScene;
                goToStep(
                    refHashMap,
                    {
                        step: MenuScene.FACTION,
                        side: mainState.side,
                        isMobileDevice,
                    },
                    () => {
                        setMenuScene(MenuScene.FACTION);
                        setNextMenuScene(undefined);
                        onTransition.current = false;
                    },
                );
            },
        };
        onTransition.current = true;
        if (menuScene === 'queue') {
            setNextMenuScene(MenuScene.FACTION);
            goToStep(
                refHashMap,
                {
                    step: MenuScene.FACTION,
                    side: mainState.side,
                    isMobileDevice,
                },
                () => {
                    onTransition.current = false;
                    setMenuScene(MenuScene.FACTION);
                    setNextMenuScene(undefined);
                    setMainState((prev) => ({
                        ...prev,
                        side: undefined,
                    }));
                    if (mode === MenuMode.DEFAULT) {
                        destroyConnection();
                    }
                },
            );
        }
        // there is no back button on home scene or on end level scene
        if (
            menuScene !== MenuScene.HOME &&
            menuScene !== MenuScene.END_LEVEL &&
            menuScene !== MenuScene.TEAM_LOBBY
        ) {
            backOptions[menuScene]();
        }
    }, [
        menuScene,
        mainState.side,
        destroyConnection,
        isMobileDevice,
        mode,
        refHashMap,
        setMenuScene,
        setMainState,
        setNextMenuScene,
    ]);

    const handleSelectLevelOnLobby = useCallback(
        (levelId: Levels) => {
            setMainState((prev) => ({
                ...prev,
                selectedLevel: levelId,
            }));
        },
        [setMainState],
    );

    const handleClickOnLevel = useCallback(
        (levelId: Levels) => {
            if (onTransition.current) {
                return;
            }
            if (teamMateDisconnected) {
                setTeamMateDisconnected(false);
            }
            setMainState((prev) => ({
                ...prev,
                selectedLevel: levelId,
            }));
            onTransition.current = true;
            setNextMenuScene(MenuScene.FACTION);
            goToStep(
                refHashMap,
                {
                    step: MenuScene.FACTION,
                    side: undefined,
                    isMobileDevice,
                },
                () => {
                    onTransition.current = false;
                    setMenuScene(MenuScene.FACTION);
                    setNextMenuScene(undefined);
                },
            );
        },
        [
            teamMateDisconnected,
            setTeamMateDisconnected,
            isMobileDevice,
            refHashMap,
            setMainState,
            setMenuScene,
            setNextMenuScene,
        ],
    );

    const handleClickOnFaction = useCallback(
        (side: Side) => {
            if (onTransition.current) {
                return;
            }
            if (teamMateDisconnected) {
                setTeamMateDisconnected(false);
            }
            setMainState((prev) => ({ ...prev, side }));
            setMenuScene(MenuScene.QUEUE);
            onTransition.current = true;
            goToStep(
                refHashMap,
                {
                    step: MenuScene.QUEUE,
                    side,
                    isMobileDevice,
                },
                () => {
                    onTransition.current = false;
                },
            );
        },
        [
            teamMateDisconnected,
            setTeamMateDisconnected,
            isMobileDevice,
            refHashMap,
            setMainState,
            setMenuScene,
        ],
    );

    const levels = useMemo(
        () => [
            {
                id: Levels.CRACK_THE_DOOR,
                name: 'Crack the door',
                img: '/crack_the_door.png',
                disabled: false,
            },
            {
                id: Levels.LEARN_TO_FLY,
                name: 'Learn to fly',
                img: '/learn_to_fly.png',
                disabled: false,
            },
            {
                id: Levels.THE_HIGH_SPHERES,
                name: 'The high spheres',
                img: '/the_high_spheres.png',
                disabled: true,
            },
        ],
        [],
    );

    const levelName = levels.find(
        (level) => level.id === mainState.selectedLevel,
    )?.name;

    const handleClickFindAnotherTeamMate = useCallback(() => {
        goToStep(
            refHashMap,
            {
                step: MenuScene.HOME,
                side: undefined,
                isMobileDevice,
            },
            () => {
                setMenuScene(MenuScene.HOME);
                setTeamMateDisconnected(false);
            },
        );
    }, [isMobileDevice, setMenuScene, setTeamMateDisconnected, refHashMap]);

    return (
        <>
            <TeamMateDisconnectNotification
                teamMateDisconnected={teamMateDisconnected}
                handleClickFindAnotherTeamMate={handleClickFindAnotherTeamMate}
            />
            <canvas
                id="white"
                style={{ zIndex: -3, background: 'white' }}
                ref={whiteCanvasDomElement}
            />
            <canvas
                id="black"
                style={{ zIndex: -2 }}
                ref={blackCanvasDomElement}
            />
            <HomeScene
                canvasBlack={blackCanvas}
                canvasWhite={whiteCanvas}
                homeRef={homeRef}
                allQueueInfo={allQueueInfo}
                handleClickOnRandom={handleClickOnRandom}
                handleClickOnFriend={handleClickOnFriend}
                isMount={
                    menuScene === MenuScene.HOME ||
                    nextMenuScene === MenuScene.HOME
                }
            />
            <InviteFriendScene
                isMount={
                    menuScene === MenuScene.INVITE_FRIEND ||
                    nextMenuScene === MenuScene.INVITE_FRIEND
                }
                handleClickOnRandom={handleClickOnRandom}
                inviteFriendRef={inviteFriendRef}
                actions={
                    <Actions
                        color="white"
                        onBack={handleClickOnBack}
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        teamMate={{
                            ...teamMate,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMate.info?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
            />
            <TeamLobbyScene
                isMount={
                    menuScene === MenuScene.TEAM_LOBBY ||
                    nextMenuScene === MenuScene.TEAM_LOBBY
                }
                handleSelectLevel={handleSelectLevelOnLobby}
                handleClickOnRandom={handleClickOnRandom}
                teamLobbyRef={teamLobbyRef}
                actions={
                    <Actions
                        color="white"
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        teamMate={{
                            ...teamMate,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMate.info?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
            />
            <LevelScene
                actions={
                    <Actions
                        color="white"
                        onBack={handleClickOnBack}
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        teamMate={{
                            ...teamMate,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMate.info?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
                allQueueInfo={allQueueInfo}
                handleClickOnLevel={handleClickOnLevel}
                levels={levels}
                levelRef={levelRef}
                isMount={
                    menuScene === MenuScene.LEVEL ||
                    nextMenuScene === MenuScene.LEVEL
                }
            />
            <SideScene
                sideRef={sideRef}
                actions={
                    <Actions
                        color="white"
                        onBack={handleClickOnBack}
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        teamMate={{
                            ...teamMate,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMate.info?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
                selectedLevel={mainState.selectedLevel}
                levelName={levelName}
                handleClickOnFaction={handleClickOnFaction}
                allQueueInfo={allQueueInfo}
                isMount={
                    menuScene === MenuScene.FACTION ||
                    nextMenuScene === MenuScene.FACTION
                }
            />
            <QueueScene
                queueRef={queueRef}
                side={mainState.side}
                levelName={levelName}
                isInQueue={menuScene === MenuScene.QUEUE}
                actions={
                    <Actions
                        color={
                            mainState.side === Side.SHADOW ? 'black' : 'white'
                        }
                        onBack={handleClickOnBack}
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        teamMate={{
                            ...teamMate,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMate.info?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
                isMount={
                    menuScene === MenuScene.QUEUE ||
                    nextMenuScene === MenuScene.QUEUE
                }
            />
            <EndLevelScene
                isMount={
                    menuScene === MenuScene.END_LEVEL ||
                    nextMenuScene === MenuScene.END_LEVEL
                }
                endLevelRef={endLevelRef}
                side={mainState.side}
                levelName={levelName}
                handleClickOnPlay={handleClickOnPlay}
                actions={
                    <Actions
                        color={
                            mainState.side === Side.SHADOW ? 'black' : 'white'
                        }
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        teamMate={{
                            ...teamMate,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMate.info?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
            />
        </>
    );
}
