// vendors
import { gsap } from 'gsap';
import * as STATS from 'stats.js';
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
import type Animation from './Animation';
import CanvasBlack from './canvas/CanvasBlack';
import CanvasWhite from './canvas/CanvasWhite';
import Mouse from './canvas/Mouse';
import { MenuMode, MenuScene } from './types';
import LevelItem from './LevelItem';
import { MainState } from '../MainApp';
import { QueueInfoText } from './QueueInfo';
import { QueueScene } from './QueueScene';
import { SideScene } from './SideScene';
import { EndLevelScene } from './EndLevelScene';
import { Actions } from './Actions';

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
}

export function Menu({
    setMainState,
    mainState,
    menuScene,
    mode,
    setMenuScene,
    destroyConnection,
    teamMate,
}: Props) {
    const [allQueueInfo, setAllQueueInfo] = useState<AllQueueInfo>();
    const blackCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const whiteCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const blackCanvas = useRef<CanvasBlack>();
    const whiteCanvas = useRef<CanvasWhite>();
    const onTransition = useRef(false);
    const animation = useRef<typeof Animation>();
    const homeRef = useRef<HTMLDivElement>(null);
    const levelRef = useRef<HTMLDivElement>(null);
    const sideRef = useRef<HTMLDivElement>(null);
    const queueRef = useRef<HTMLDivElement>(null);
    const endLevelRef = useRef<HTMLDivElement>(null);
    const menuStarted = useRef(false);

    const isMobileDevice = useMemo(() => {
        if (!window) {
            return true;
        }
        return window.innerWidth <= 768;
    }, []);

    const resize = useCallback(() => {
        if (
            !animation.current ||
            !blackCanvas.current ||
            !whiteCanvas.current
        ) {
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
        animation.current.runMethodForAllBothSideComponents('resize', [
            blackCanvas.current.ctx,
        ]);
    }, [isMobileDevice, menuScene, mainState.side]);

    // effect to start to render the menu animation
    useEffect(() => {
        let canvasLoop: (() => void) | undefined = undefined;
        Promise.all([
            import('./Animation').then((mod) => mod.default),
            import('./crossBrowser'),
        ]).then(([Animation]) => {
            if (menuStarted.current) {
                return;
            }
            animation.current = Animation;
            blackCanvas.current = new CanvasBlack(
                blackCanvasDomElement.current as HTMLCanvasElement,
            );
            whiteCanvas.current = new CanvasWhite(
                whiteCanvasDomElement.current as HTMLCanvasElement,
            );
            Animation.initComponents(
                {
                    homeInterface: homeRef,
                    levelInterface: levelRef,
                    factionInterface: sideRef,
                    queueInterface: queueRef,
                },
                blackCanvas.current,
                whiteCanvas.current,
                menuScene,
                isMobileDevice,
            );
            const stats = (() => {
                if (process.env.NEXT_PUBLIC_STAGE === 'development') {
                    const stats = new STATS.default();
                    stats.showPanel(1);
                    document.body.appendChild(stats.dom);
                    return stats;
                }
                return undefined;
            })();
            canvasLoop = () => {
                stats?.begin();
                blackCanvas.current!.render();
                whiteCanvas.current!.render();
                stats?.end();
            };
            Mouse.init();
            resize();
            gsap.ticker.add(canvasLoop);
            menuStarted.current = true;
        });

        return () => {
            if (canvasLoop) {
                gsap.ticker.remove(canvasLoop);
            }
            Mouse.destroy();
        };
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

    const handleMouseEnterPlay = useCallback(() => {
        if (!animation.current) {
            return;
        }
        animation.current.playMouseEnterButtonPlay();
    }, []);

    const handleMouseLeavePlay = useCallback(() => {
        if (!animation.current) {
            return;
        }
        if (!onTransition.current) {
            animation.current.playMouseLeaveButtonPlay();
        }
    }, []);

    const handleClickOnPlay = useCallback(() => {
        if (!animation.current) {
            return;
        }
        onTransition.current = true;
        animation.current.goToStep(MenuScene.LEVEL, () => {
            onTransition.current = false;
            setMenuScene(MenuScene.LEVEL);
            animation.current?.playMouseLeaveButtonPlay();
        });
    }, []);

    const handleClickOnQuitTeam = useCallback(() => {
        if (!animation.current) {
            return;
        }
        animation.current.goToStep(MenuScene.HOME, () => {
            onTransition.current = false;
            setMenuScene(MenuScene.HOME);
            destroyConnection();
        });
    }, []);

    const handleClickOnBack = useCallback(() => {
        if (!animation.current) {
            return;
        }
        const backOptions = {
            level() {
                animation.current!.goToStep(MenuScene.HOME, () => {
                    onTransition.current = false;
                    setMenuScene(MenuScene.HOME);
                });
            },
            faction() {
                animation.current!.goToStep(MenuScene.LEVEL, () => {
                    onTransition.current = false;
                    setMenuScene(MenuScene.LEVEL);
                });
            },
            queue() {
                animation.current!.goToStep(MenuScene.FACTION, () => {
                    onTransition.current = false;
                    setMenuScene(MenuScene.FACTION);
                });
            },
        };
        onTransition.current = true;
        if (menuScene === 'queue') {
            animation.current!.goToStep(MenuScene.FACTION, () => {
                onTransition.current = false;
                setMenuScene(MenuScene.FACTION);
                setMainState((prev) => ({
                    ...prev,
                    side: undefined,
                }));
                if (mode === MenuMode.DEFAULT) {
                    destroyConnection();
                }
            });
        }
        // there is no back button on home scene or on end level scene
        if (menuScene !== MenuScene.HOME && menuScene !== MenuScene.END_LEVEL) {
            backOptions[menuScene]();
        }
    }, [menuScene, destroyConnection]);

    const handleClickOnLevel = useCallback((levelId: Levels) => {
        if (!animation.current) {
            return;
        }
        setMainState((prev) => ({
            ...prev,
            selectedLevel: levelId,
        }));
        onTransition.current = true;
        animation.current.goToStep(MenuScene.FACTION, () => {
            onTransition.current = false;
            setMenuScene(MenuScene.FACTION);
        });
    }, []);

    const handleClickOnFaction = useCallback((side: Side) => {
        if (!animation.current) {
            return;
        }
        setMainState((prev) => ({ ...prev, side }));
        setMenuScene(MenuScene.QUEUE);
        animation.current.faction = side;
        onTransition.current = true;
        animation.current.goToStep(MenuScene.QUEUE, () => {
            onTransition.current = false;
        });
    }, []);

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
                disabled: true,
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

    return (
        <>
            <canvas
                id="white"
                style={{ zIndex: -3 }}
                ref={whiteCanvasDomElement}
            />
            <canvas
                id="black"
                style={{ zIndex: -2 }}
                ref={blackCanvasDomElement}
            />
            <div
                ref={homeRef}
                className={`home-container ${
                    menuScene !== 'home' ? 'unmount' : ''
                }`}
            >
                <h1 className="title-h1">Composite</h1>
                <h2 className="main-subtitle">Think both ways</h2>
                {allQueueInfo && (
                    <>
                        <QueueInfoText
                            side="light"
                            value={allQueueInfo.light}
                        />
                        <QueueInfoText
                            side="shadow"
                            value={allQueueInfo.shadow}
                        />
                    </>
                )}
                <button
                    className="buttonCircle"
                    id="buttonPlay"
                    onMouseEnter={handleMouseEnterPlay}
                    onMouseLeave={handleMouseLeavePlay}
                    onClick={handleClickOnPlay}
                >
                    Play
                </button>
            </div>
            <div
                ref={levelRef}
                className={`content-container level-container ${
                    menuScene !== 'level' ? 'unmount' : ''
                }`}
            >
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
                <h2 className="title-h2">Select a&nbsp;level</h2>
                {levels.map((item) => (
                    <LevelItem
                        {...item}
                        key={item.name}
                        onClick={handleClickOnLevel}
                        queueInfo={allQueueInfo?.levels[item.id]}
                    />
                ))}
            </div>
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
