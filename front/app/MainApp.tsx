'use client';
// vendors
import React, {
    createContext,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
import * as STATS from 'stats.js';
// our libs
import {
    GameState,
    Levels,
    MovableComponentState,
    ProjectionLevel,
    Side,
} from '@benjaminbours/composite-core';
// local
import { MenuScene } from './types';
import { SettingsMenu } from './SettingsMenu';
import InputsManager from './Game/Player/InputsManager';
import { BottomRightInfo } from './BottomRightInfo';
import { useMainController } from './useMainController';
import { useMenuTransition } from './useMenuTransition';
import { TeamMateDisconnectNotification } from './TeamMateDisconnectNotification';

export const AppContext = createContext({
    setMenuScene: (_scene: MenuScene) => {},
    enterTeamLobby: (_token: string) => {},
});

const Menu = dynamic(() => import('./Menu'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

const Game = dynamic(() => import('./Game'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

// almost the same state in Menu
export interface MainState {
    side: Side | undefined;
    selectedLevel: Levels | undefined;
    gameState: GameState | undefined;
}

interface Props {
    children: React.ReactNode;
}

/**
 * MainApp is responsible to manage the orchestration between the Menu (2D part, the queue management, etc), the game (3D part) and the socket connection.
 */
function MainApp({ children }: Props) {
    const inputsManager = useRef<InputsManager>(new InputsManager());

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tabIsHidden, setTabIsHidden] = useState(false);
    const statsRef = useRef<Stats>();

    const {
        menuScene,
        nextMenuScene,
        refHashMap,
        goToStep,
        onTransition,
        setMenuScene,
    } = useMenuTransition();

    const {
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
    } = useMainController(menuScene, setMenuScene, goToStep, onTransition);

    const handleClickOnSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    const handleClickOnCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
    }, []);

    // effect dedicated to tab switching
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_STAGE === 'development') {
            const stats = new STATS.default();
            stats.showPanel(1);
            document.body.appendChild(stats.dom);
            statsRef.current = stats;
        }
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabIsHidden(true);
            } else {
                setTabIsHidden(false);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            if (statsRef.current) {
                document.body.removeChild(statsRef.current.dom);
            }
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);

    // effect use in development mode only
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_SKIP_MATCHMAKING) {
            establishConnection().then(() => {
                const level = new ProjectionLevel();
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
        }
    }, [establishConnection, sendMatchMakingInfo, handleGameStart]);

    if (process.env.NEXT_PUBLIC_SKIP_MATCHMAKING) {
        return (
            <>
                {state.gameState && (
                    <Game
                        initialGameState={state.gameState}
                        side={state.side!}
                        socketController={socketController.current}
                        tabIsHidden={tabIsHidden}
                        stats={statsRef}
                        inputsManager={inputsManager.current}
                    />
                )}
                {isSettingsOpen && (
                    <SettingsMenu
                        inputsManager={inputsManager.current}
                        onClose={handleClickOnCloseSettings}
                    />
                )}
                <BottomRightInfo onSettingsClick={handleClickOnSettings} />
            </>
        );
    }

    return (
        <AppContext.Provider
            value={{
                setMenuScene,
                enterTeamLobby: handleEnterTeamLobby,
            }}
        >
            <TeamMateDisconnectNotification
                teamMateDisconnected={teamMateDisconnected}
                handleClickFindAnotherTeamMate={handleClickFindAnotherTeamMate}
            />
            {!gameIsPlaying && (
                <Menu
                    mainState={state}
                    menuScene={menuScene}
                    nextMenuScene={nextMenuScene}
                    mode={menuMode}
                    teamMateInfo={teamMateInfo}
                    stats={statsRef}
                    inviteFriendToken={inviteFriendToken}
                    refHashMap={refHashMap}
                    handleEnterRandomQueue={handleEnterRandomQueue}
                    handleClickPlayWithFriend={handleClickPlayWithFriend}
                    handleClickPlayWithRandom={handleClickPlayWithRandom}
                    handleSelectLevelOnLobby={handleSelectLevelOnLobby}
                    handleSelectSideOnLobby={handleSelectSideOnLobby}
                    handleSelectLevel={handleSelectLevel}
                    handleClickOnBack={handleClickOnBack}
                    handleClickOnQuitTeam={handleClickOnQuitTeam}
                    handleClickHome={handleClickHome}
                    handleClickOnJoinTeamMate={handleClickOnJoinTeamMate}
                />
            )}
            {state.gameState && gameIsPlaying && (
                <Game
                    side={state.side!}
                    initialGameState={state.gameState}
                    socketController={socketController.current}
                    tabIsHidden={tabIsHidden}
                    stats={statsRef}
                    inputsManager={inputsManager.current}
                />
            )}
            {isSettingsOpen && (
                <SettingsMenu
                    inputsManager={inputsManager.current}
                    onClose={handleClickOnCloseSettings}
                />
            )}
            <BottomRightInfo onSettingsClick={handleClickOnSettings} />
            {children}
        </AppContext.Provider>
    );
}

export default MainApp;
