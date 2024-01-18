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
} from './scenes';
import { Actions } from './Actions';
import { TeamMateDisconnectNotification } from '../TeamMateDisconnectNotification';
import { goToStep } from './tweens';

interface Props {
    mainState: MainState;
    setMainState: React.Dispatch<React.SetStateAction<MainState>>;
    menuScene: MenuScene;
    mode: MenuMode;
    setMenuScene: React.Dispatch<React.SetStateAction<MenuScene>>;
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
        }),
        [],
    );

    const resize = useCallback(() => {
        if (!blackCanvas.current || !whiteCanvas.current) {
            return;
        }
        const isMobileDevice = window.innerWidth <= 768;
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
        goToStep(
            refHashMap,
            { step: MenuScene.LEVEL, side: undefined, isMobileDevice },
            () => {
                onTransition.current = false;
                setMenuScene(MenuScene.LEVEL);
            },
        );
    }, [
        // teamMateDisconnected,
        // setTeamMateDisconnected,
        isMobileDevice,
        refHashMap,
        setMenuScene,
    ]);

    const handleClickOnQuitTeam = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        goToStep(
            refHashMap,
            { step: MenuScene.HOME, side: undefined, isMobileDevice },
            () => {
                onTransition.current = false;
                setMenuScene(MenuScene.HOME);
                destroyConnection();
            },
        );
    }, [isMobileDevice, refHashMap, setMenuScene, destroyConnection]);

    const handleClickOnBack = useCallback(() => {
        if (onTransition.current) {
            return;
        }
        const backOptions = {
            invite_friend() {
                goToStep(
                    refHashMap,
                    { step: MenuScene.HOME, side: undefined, isMobileDevice },
                    () => {
                        onTransition.current = false;
                        setMenuScene(MenuScene.HOME);
                    },
                );
            },
            level() {
                setMenuScene(MenuScene.HOME);
                goToStep(
                    refHashMap,
                    { step: MenuScene.HOME, side: undefined, isMobileDevice },
                    () => {
                        onTransition.current = false;
                    },
                );
            },
            faction() {
                goToStep(
                    refHashMap,
                    { step: MenuScene.LEVEL, side: undefined, isMobileDevice },
                    () => {
                        onTransition.current = false;
                        setMenuScene(MenuScene.LEVEL);
                    },
                );
            },
            queue() {
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
                    },
                );
            },
        };
        onTransition.current = true;
        if (menuScene === 'queue') {
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
        if (menuScene !== MenuScene.HOME && menuScene !== MenuScene.END_LEVEL) {
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
    ]);

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
                currentScene={menuScene}
                homeRef={homeRef}
                allQueueInfo={allQueueInfo}
                handleClickOnRandom={handleClickOnRandom}
            />
            <InviteFriendScene
                currentScene={menuScene}
                inviteFriendRef={inviteFriendRef}
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
                currentScene={menuScene}
                levelRef={levelRef}
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
                currentScene={menuScene}
                selectedLevel={mainState.selectedLevel}
                levelName={levelName}
                handleClickOnFaction={handleClickOnFaction}
                allQueueInfo={allQueueInfo}
            />
            <QueueScene
                queueRef={queueRef}
                currentScene={menuScene}
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
            />
            <EndLevelScene
                endLevelRef={endLevelRef}
                currentScene={menuScene}
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
