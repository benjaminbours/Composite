'use client';
// vendors
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
import * as STATS from 'stats.js';
// local
import { MenuScene } from './types';
import { SettingsMenu } from './SettingsMenu';
import InputsManager from './Game/Player/InputsManager';
import { BottomRightInfo } from './BottomRightInfo';
import { useMainController } from './useMainController';
import { useMenuTransition } from './useMenuTransition';
import { TeamMateDisconnectNotification } from './TeamMateDisconnectNotification';
import { AppContext } from './WithMainApp';
import { getDictionary } from '../getDictionary';

const Menu = dynamic(() => import('./Menu'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

const Game = dynamic(() => import('./Game'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

// almost the same state in Menu

interface Props {
    initialScene?: MenuScene;
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

/**
 * MainApp is responsible to manage the orchestration between the Menu (2D part, the queue management, etc), the game (3D part) and the socket connection.
 */
function MainApp({ initialScene, dictionary }: Props) {
    const { setMainAppContext } = useContext(AppContext);
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
        lightToStep,
        shadowToStep,
    } = useMenuTransition(initialScene);

    const {
        state,
        socketController,
        gameIsPlaying,
        levels,
        handleEnterTeamLobby,
        handleInviteFriend,
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
    } = useMainController(
        menuScene,
        setMenuScene,
        goToStep,
        lightToStep,
        shadowToStep,
        onTransition,
    );

    const handleClickOnSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    const handleClickOnCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
    }, []);

    // effect dedicated to tab switching
    useEffect(() => {
        setMainAppContext({
            setMenuScene,
            // enterTeamLobby: handleEnterTeamLobby,
        });
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

    return (
        <>
            <TeamMateDisconnectNotification
                teamMateDisconnected={state.teamMate === 'disconnected'}
                // handleClickFindAnotherTeamMate={handleClickFindAnotherTeamMate}
            />
            {!gameIsPlaying && (
                <Menu
                    dictionary={dictionary}
                    mainState={state}
                    menuScene={menuScene}
                    nextMenuScene={nextMenuScene}
                    stats={statsRef}
                    refHashMap={refHashMap}
                    levels={levels}
                    handleEnterRandomQueue={handleEnterRandomQueue}
                    handleClickPlayWithFriend={handleClickPlayWithFriend}
                    handleClickPlayWithRandom={handleClickPlayWithRandom}
                    handleSelectLevelOnLobby={handleSelectLevelOnLobby}
                    handleSelectSideOnLobby={handleSelectSideOnLobby}
                    handleSelectLevel={handleSelectLevel}
                    handleClickOnBack={handleClickOnBack}
                    handleClickOnQuitTeam={handleClickOnQuitTeam}
                    handleClickHome={handleClickHome}
                    handleClickPlayAgain={handleClickPlayAgain}
                    handleInviteFriend={handleInviteFriend}
                    handleEnterTeamLobby={handleEnterTeamLobby}
                />
            )}
            {state.gameState &&
                state.loadedLevel &&
                gameIsPlaying &&
                socketController.current && (
                    <Game
                        side={state.side!}
                        multiplayerGameProps={{
                            socketController: socketController.current,
                            initialGameState: state.gameState,
                            level: state.loadedLevel,
                        }}
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

export default MainApp;
