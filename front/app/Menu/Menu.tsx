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
import { AllQueueInfo, Side } from '@benjaminbours/composite-core';
// local
import CanvasBlack from './canvas/CanvasBlack';
import CanvasWhite from './canvas/CanvasWhite';
import Mouse from './canvas/Mouse';
import { MenuScene } from '../types';
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
import { useMainController } from '../useMainController';
import { getDictionary } from '../../getDictionary';
import { servicesContainer } from '../core/frameworks';
import { ApiClient } from '../core/services';

interface Props {
    menuScene: MenuScene;
    nextMenuScene: MenuScene | undefined;
    refHashMap: RefHashMap;
    stats: React.MutableRefObject<Stats | undefined>;
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    mainController: ReturnType<typeof useMainController>;
}

export const QUEUE_INFO_FETCH_INTERVAL = 20000;

export function Menu({
    dictionary,
    menuScene,
    stats,
    nextMenuScene,
    refHashMap,
    mainController,
}: Props) {
    const [queueInfoInterval, setQueueInfoInterval] =
        useState<NodeJS.Timeout>();
    const [fetchCompletionInterval, setFetchCompletionInterval] =
        useState<NodeJS.Timeout>();
    const [allQueueInfo, setAllQueueInfo] = useState<AllQueueInfo>();
    const [fetchTime, setFetchTime] = useState(0);
    const blackCanvasDomElement = useRef<HTMLCanvasElement>(null);
    const whiteCanvasDomElement = useRef<HTMLCanvasElement>(null);

    const {
        state,
        setState,
        levels,
        handleClickOnBack,
        handleClickHome,
        handleClickPlayAgain,
        handleClickPlayWithFriend,
        handleClickPlayWithRandom,
        handleClickReadyToPlay,
        handleSelectLevelOnLobby,
        handleSelectSideOnLobby,
        handleInviteFriend,
        handleSelectLevel,
        handleEnterTeamLobby,
        handleEnterRandomQueue,
        handleExitRandomQueue,
    } = mainController;

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
            side: state.you.side,
        });
        refHashMap.canvasWhite.current.resize({
            isMobileDevice,
            currentScene: menuScene,
            side: state.you.side,
        });
    }, [menuScene, state.you.side, refHashMap]);

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

    const fetchQueueInfo = useCallback(async () => {
        const apiClient = servicesContainer.get(ApiClient);
        return apiClient.defaultApi.appControllerGetQueueInfo().then((data) => {
            console.log('HERE queue', data);

            // clear previous interval
            clearInterval(queueInfoInterval);
            clearInterval(fetchCompletionInterval);
            const intervalId = setInterval(() => {
                // console.log('fetch');
                fetchQueueInfo();
            }, QUEUE_INFO_FETCH_INTERVAL);

            const completionIntervalId = setInterval(() => {
                // console.log('time update');
                setFetchTime((prev) => prev + 1000);
            }, 1000);

            setFetchTime(0);
            setFetchCompletionInterval(completionIntervalId);
            setQueueInfoInterval(intervalId);
            setAllQueueInfo(data as AllQueueInfo);
            setState((prev) => ({
                ...prev,
                shouldDisplayQueueInfo: true,
            }));
        });
    }, [setState, queueInfoInterval, fetchCompletionInterval]);

    const handleClickOnQueueInfo = useCallback(() => {
        if (!state.shouldDisplayQueueInfo) {
            fetchQueueInfo();
        } else {
            setState((prev) => ({
                ...prev,
                shouldDisplayQueueInfo: false,
            }));
        }
    }, [fetchQueueInfo, state, setState]);

    useEffect(() => {
        if (!state.shouldDisplayQueueInfo && queueInfoInterval) {
            clearInterval(fetchCompletionInterval);
            clearInterval(queueInfoInterval);
            setQueueInfoInterval(undefined);
        }

        return () => {
            clearInterval(queueInfoInterval);
            clearInterval(fetchCompletionInterval);
        };
    }, [
        state.shouldDisplayQueueInfo,
        queueInfoInterval,
        fetchCompletionInterval,
    ]);

    // on resize
    useEffect(() => {
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, [resize]);

    const levelName = levels.find(
        (level) => level.id === state.you.level,
    )?.name;

    const actions = useMemo(() => {
        return (
            <Actions
                onBack={handleClickOnBack}
                // onQuitTeam={mode === '' ? handleClickOnQuitTeam : undefined}
                // onClickJoinTeamMate={handleClickOnJoinTeamMate}
                // teamMate={{
                //     info: teamMateInfo,
                //     levelName: levels.find(
                //         (level) => level.id === teamMateInfo?.selectedLevel,
                //     )?.name,
                // }}
            />
        );
    }, [
        handleClickOnBack,
        // handleClickOnJoinTeamMate,
        // handleClickOnQuitTeam,
        // levels,
        // teamMateInfo,
    ]);

    const setLightIsPulsingFast = useCallback(
        (value: boolean) => {
            if (!refHashMap.canvasBlack.current) {
                return;
            }
            refHashMap.canvasBlack.current.light.isPulsingFast = value;
        },
        [refHashMap.canvasBlack],
    );

    const setShadowRotationSpeed = useCallback(
        (rotationSpeed: number) => {
            if (!refHashMap.canvasWhite.current) {
                return;
            }
            gsap.to(refHashMap.canvasWhite.current.shadow, {
                duration: 1,
                rotationSpeed,
                ease: 'power3.easeOut',
            });
        },
        [refHashMap.canvasWhite],
    );

    const setSideSize = useCallback(
        (side: Side, size: number) => {
            if (side === Side.LIGHT) {
                if (!refHashMap.canvasBlack.current) {
                    return;
                }
                gsap.to(refHashMap.canvasBlack.current.light, {
                    duration: 1,
                    width: size,
                    ease: 'power3.easeOut',
                });
            } else {
                if (!refHashMap.canvasWhite.current) {
                    return;
                }
                gsap.to(refHashMap.canvasWhite.current.shadow, {
                    duration: 1,
                    width: size,
                    ease: 'power3.easeOut',
                });
            }
        },
        [refHashMap.canvasWhite, refHashMap.canvasBlack],
    );

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
                setLightIsPulsingFast={setLightIsPulsingFast}
                setShadowRotationSpeed={setShadowRotationSpeed}
            />
            {/* <InviteFriendScene
                isMount={
                    menuScene === MenuScene.INVITE_FRIEND ||
                    nextMenuScene === MenuScene.INVITE_FRIEND
                }
                handleClickOnRandom={handleClickPlayWithRandom}
                inviteFriendRef={refHashMap.inviteFriendRef}
                actions={actions}
            /> */}
            <TeamLobbyScene
                dictionary={dictionary}
                isMount={
                    menuScene === MenuScene.TEAM_LOBBY ||
                    nextMenuScene === MenuScene.TEAM_LOBBY
                }
                handleClickReadyToPlay={handleClickReadyToPlay}
                handleSelectLevel={handleSelectLevelOnLobby}
                handleSelectSide={handleSelectSideOnLobby}
                you={state.you}
                mate={state.mate}
                teamLobbyRef={refHashMap.teamLobbyRef}
                levels={levels}
                actions={actions}
                setLightIsPulsingFast={setLightIsPulsingFast}
                setShadowRotationSpeed={setShadowRotationSpeed}
                inviteFriend={handleInviteFriend}
                handleEnterTeamLobby={handleEnterTeamLobby}
                setSideSize={setSideSize}
                handleEnterRandomQueue={handleEnterRandomQueue}
                handleExitRandomQueue={handleExitRandomQueue}
                isInQueue={state.isInQueue}
                fetchQueueInfo={fetchQueueInfo}
                handleClickOnQueueInfo={handleClickOnQueueInfo}
                fetchTime={fetchTime}
                queueInfo={allQueueInfo}
                shouldDisplayQueueInfo={state.shouldDisplayQueueInfo}
            />
            <LevelScene
                actions={actions}
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
                actions={actions}
                selectedLevel={state.you.level}
                levelName={levelName}
                // onClickOnFaction={handleEnterRandomQueue}
                allQueueInfo={allQueueInfo}
                isMount={
                    menuScene === MenuScene.FACTION ||
                    nextMenuScene === MenuScene.FACTION
                }
            />
            <QueueScene
                queueRef={refHashMap.queueRef}
                side={state.you.side}
                levelName={levelName}
                isInQueue={menuScene === MenuScene.QUEUE}
                actions={actions}
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
                side={state.you.side}
                levelName={levelName}
                handleClickOnPlay={handleClickPlayAgain}
                actions={actions}
                setLightIsPulsingFast={setLightIsPulsingFast}
                setShadowRotationSpeed={setShadowRotationSpeed}
            />
        </>
    );
}
