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
import { MenuMode, MenuScene } from '../types';
import { MainState } from '../MainApp';
import {
    QueueScene,
    SideScene,
    EndLevelScene,
    LevelScene,
    HomeScene,
    InviteFriendScene,
    TeamLobbyScene,
    NotFoundScene,
} from './scenes';
import { Actions } from './Actions';
import { RefHashMap } from '../useMenuTransition';

interface Props {
    mainState: MainState;
    menuScene: MenuScene;
    nextMenuScene: MenuScene | undefined;
    mode: MenuMode;
    teamMateInfo: TeammateInfoPayload | undefined;
    refHashMap: RefHashMap;
    stats: React.MutableRefObject<Stats | undefined>;
    inviteFriendToken: string | undefined;
    // main controller events
    handleClickPlayWithFriend: () => void;
    handleClickPlayWithRandom: () => void;
    handleSelectLevelOnLobby: (levelId: Levels) => void;
    handleSelectSideOnLobby: (side: Side) => void;
    handleSelectLevel: (levelId: Levels) => void;
    handleEnterRandomQueue: (side: Side) => void;
    handleClickOnBack: () => void;
    handleClickOnQuitTeam: () => void;
    handleClickHome: () => void;
    handleClickOnJoinTeamMate: () => void;
}

export function Menu({
    mainState,
    menuScene,
    mode,
    teamMateInfo,
    stats,
    nextMenuScene,
    inviteFriendToken,
    refHashMap,
    handleClickPlayWithFriend,
    handleClickPlayWithRandom,
    handleSelectLevel,
    handleEnterRandomQueue,
    handleSelectLevelOnLobby,
    handleSelectSideOnLobby,
    handleClickOnBack,
    handleClickOnQuitTeam,
    handleClickHome,
    handleClickOnJoinTeamMate,
}: Props) {
    const [allQueueInfo, setAllQueueInfo] = useState<AllQueueInfo>();
    const blackCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const whiteCanvasDomElement = useRef<HTMLCanvasElement>(null);

    const resize = useCallback(() => {
        if (
            !refHashMap.canvasBlack.current ||
            !refHashMap.canvasWhite.current
        ) {
            return;
        }
        const isMobileDevice = window.innerWidth <= 768;
        refHashMap.canvasBlack.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            side: mainState.side,
        });
        refHashMap.canvasWhite.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            side: mainState.side,
        });
    }, [menuScene, mainState.side, refHashMap]);

    const canvasLoop = useCallback(() => {
        stats.current?.begin();
        refHashMap.canvasBlack.current?.render();
        refHashMap.canvasWhite.current?.render();
        stats.current?.end();
        // disable on purpose, I want this not to change after mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // effect to start to render the menu animation
    useEffect(() => {
        refHashMap.canvasBlack.current = new CanvasBlack(
            blackCanvasDomElement.current as HTMLCanvasElement,
        );
        refHashMap.canvasWhite.current = new CanvasWhite(
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

    const levels = useMemo(
        () => [
            {
                id: Levels.CRACK_THE_DOOR,
                name: 'Crack the door',
                img: '/crack_the_door.png',
                disabled: false,
                selectedByTeamMate: false,
            },
            {
                id: Levels.LEARN_TO_FLY,
                name: 'Learn to fly',
                img: '/learn_to_fly.png',
                disabled: false,
                selectedByTeamMate: true,
            },
            {
                id: Levels.THE_HIGH_SPHERES,
                name: 'The high spheres',
                img: '/the_high_spheres.png',
                disabled: true,
                selectedByTeamMate: false,
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
                style={{ zIndex: -3, background: 'white' }}
                ref={whiteCanvasDomElement}
            />
            <canvas
                id="black"
                style={{ zIndex: -2 }}
                ref={blackCanvasDomElement}
            />
            <NotFoundScene
                isMount={
                    menuScene === MenuScene.NOT_FOUND ||
                    nextMenuScene === MenuScene.NOT_FOUND
                }
                notFoundRef={refHashMap.notFoundRef}
                onHomeClick={handleClickHome}
            />
            <HomeScene
                canvasBlack={refHashMap.canvasBlack}
                canvasWhite={refHashMap.canvasWhite}
                homeRef={refHashMap.homeRef}
                allQueueInfo={allQueueInfo}
                handleClickOnRandom={handleClickPlayWithRandom}
                handleClickOnFriend={handleClickPlayWithFriend}
                isMount={
                    menuScene === MenuScene.HOME ||
                    nextMenuScene === MenuScene.HOME
                }
            />
            <InviteFriendScene
                inviteFriendToken={inviteFriendToken}
                isMount={
                    menuScene === MenuScene.INVITE_FRIEND ||
                    nextMenuScene === MenuScene.INVITE_FRIEND
                }
                handleClickOnRandom={handleClickPlayWithRandom}
                inviteFriendRef={refHashMap.inviteFriendRef}
                actions={
                    <Actions
                        color="white"
                        onBack={handleClickOnBack}
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        onClickJoinTeamMate={handleClickOnJoinTeamMate}
                        teamMate={{
                            info: teamMateInfo,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMateInfo?.selectedLevel,
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
                handleSelectSide={handleSelectSideOnLobby}
                teamLobbyRef={refHashMap.teamLobbyRef}
                levels={levels}
                actions={
                    <Actions
                        color="white"
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        onClickJoinTeamMate={handleClickOnJoinTeamMate}
                        teamMate={{
                            info: teamMateInfo,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMateInfo?.selectedLevel,
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
                        onClickJoinTeamMate={handleClickOnJoinTeamMate}
                        teamMate={{
                            info: teamMateInfo,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMateInfo?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
                allQueueInfo={allQueueInfo}
                onClickOnLevel={handleSelectLevel}
                levels={levels}
                levelRef={refHashMap.levelRef}
                isMount={
                    menuScene === MenuScene.LEVEL ||
                    nextMenuScene === MenuScene.LEVEL
                }
            />
            <SideScene
                sideRef={refHashMap.sideRef}
                actions={
                    <Actions
                        color="white"
                        onBack={handleClickOnBack}
                        onQuitTeam={
                            mode === MenuMode.IN_TEAM
                                ? handleClickOnQuitTeam
                                : undefined
                        }
                        onClickJoinTeamMate={handleClickOnJoinTeamMate}
                        teamMate={{
                            info: teamMateInfo,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMateInfo?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
                selectedLevel={mainState.selectedLevel}
                levelName={levelName}
                onClickOnFaction={handleEnterRandomQueue}
                allQueueInfo={allQueueInfo}
                isMount={
                    menuScene === MenuScene.FACTION ||
                    nextMenuScene === MenuScene.FACTION
                }
            />
            <QueueScene
                queueRef={refHashMap.queueRef}
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
                        onClickJoinTeamMate={handleClickOnJoinTeamMate}
                        teamMate={{
                            info: teamMateInfo,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMateInfo?.selectedLevel,
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
                endLevelRef={refHashMap.endLevelRef}
                side={mainState.side}
                levelName={levelName}
                // TODO: This has to change
                handleClickOnPlay={handleClickPlayWithRandom}
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
                        onClickJoinTeamMate={handleClickOnJoinTeamMate}
                        teamMate={{
                            info: teamMateInfo,
                            levelName: levels.find(
                                (level) =>
                                    level.id === teamMateInfo?.selectedLevel,
                            )?.name,
                        }}
                    />
                }
            />
        </>
    );
}
