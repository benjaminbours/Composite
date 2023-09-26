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
import { AllQueueInfo, Levels, Side } from '@benjaminbours/composite-core';
// local
import type Animation from './Animation';
import CanvasBlack from './canvas/CanvasBlack';
import CanvasWhite from './canvas/CanvasWhite';
import Mouse from './canvas/Mouse';
import { Scene } from './types';
import ButtonBack from './ButtonBack';
import LevelItem from './LevelItem';
import { MainState } from '../MainApp';
import { QueueInfoText } from './QueueInfo';
import { QueueScene } from './QueueScene';
import { SideScene } from './SideScene';

interface Props {
    mainState: MainState;
    setMainState: React.Dispatch<React.SetStateAction<MainState>>;
}

export function Menu({ setMainState, mainState }: Props) {
    const [currentScene, setCurrentScene] = useState<Scene>('home');
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
    const menuStarted = useRef(false);

    const isMobileDevice = useMemo(() => {
        if (!window) {
            return true;
        }
        return window.innerWidth <= 768;
    }, []);

    const initAnimations = useCallback((animation: typeof Animation) => {
        animation.initHomeToLevel(() => {
            onTransition.current = false;
            setCurrentScene('level');
        });
        animation.initLevelToHome(() => {
            onTransition.current = false;
            setCurrentScene('home');
        });
        animation.initLevelToFaction(() => {
            onTransition.current = false;
            setCurrentScene('faction');
        });
        animation.initFactionToLevel(() => {
            onTransition.current = false;
            setCurrentScene('level');
        });
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
            currentScene,
            side: mainState.side,
        });
        whiteCanvas.current.resize({
            isMobileDevice,
            currentScene,
            side: mainState.side,
        });
        animation.current.runMethodForAllBothSideComponents('resize', [
            blackCanvas.current.ctx,
        ]);
        initAnimations(animation.current);
    }, [isMobileDevice, currentScene, mainState.side]);

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
                currentScene,
                isMobileDevice,
            );
            initAnimations(Animation);
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
    }, [initAnimations, resize]);

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
        animation.current.playHomeToLevel();
    }, []);

    const handleClickOnBack = useCallback(() => {
        if (!animation.current) {
            return;
        }
        const backOptions = {
            level() {
                animation.current!.playLevelToHome();
            },
            faction() {
                animation.current!.playFactionToLevel();
            },
            queue() {
                animation.current!.playQueueToFaction();
            },
        };
        onTransition.current = true;
        if (currentScene === 'queue') {
            animation.current.initQueueToFaction(() => {
                onTransition.current = false;
                setCurrentScene('faction');
            });
        }
        if (currentScene !== 'home') {
            backOptions[currentScene]();
        }
    }, [currentScene]);

    const handleClickOnLevel = useCallback((levelId: Levels) => {
        if (!animation.current) {
            return;
        }
        setMainState((prev) => ({
            ...prev,
            selectedLevel: levelId,
        }));
        onTransition.current = true;
        animation.current.playLevelToFaction();
    }, []);

    const handleClickOnFaction = useCallback((side: Side) => {
        if (!animation.current) {
            return;
        }
        animation.current.faction = side;
        setCurrentScene('queue');
        setMainState((prev) => ({ ...prev, side }));
        animation.current.initFactionToQueue(() => {
            onTransition.current = true;
        });
        animation.current.playFactionToQueue();
    }, []);

    const levels = useMemo(
        () => [
            {
                id: Levels.CRACK_THE_DOOR,
                name: 'Crack the door',
                img: '/crack_the_door.png',
            },
            {
                id: Levels.LEARN_TO_FLY,
                name: 'Learn to fly',
                img: '/learn_to_fly.png',
            },
            {
                id: Levels.THE_HIGH_SPHERES,
                name: 'The hight spheres',
                img: '/the_hight_spheres.png',
            },
        ],
        [],
    );

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
                    currentScene !== 'home' ? 'unmount' : ''
                }`}
            >
                <h2>Think both ways</h2>
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
                className={`level-container ${
                    currentScene !== 'level' ? 'unmount' : ''
                }`}
            >
                <ButtonBack color="white" onClick={handleClickOnBack} />
                <div className="level-list">
                    <h2>Select a&nbsp;level</h2>
                    {levels.map((item) => (
                        <LevelItem
                            {...item}
                            key={item.name}
                            onClick={handleClickOnLevel}
                            queueInfo={allQueueInfo?.levels[item.id]}
                        />
                    ))}
                </div>
            </div>
            <SideScene
                sideRef={sideRef}
                currentScene={currentScene}
                selectedLevel={mainState.selectedLevel}
                levelName={
                    levels.find((level) => level.id === mainState.selectedLevel)
                        ?.name
                }
                handleClickOnFaction={handleClickOnFaction}
                handleClickOnBack={handleClickOnBack}
                allQueueInfo={allQueueInfo}
            />
            <QueueScene
                queueRef={queueRef}
                currentScene={currentScene}
                side={mainState.side}
                levelName={
                    levels.find((level) => level.id === mainState.selectedLevel)
                        ?.name
                }
                handleClickOnBack={handleClickOnBack}
            />
        </>
    );
}
