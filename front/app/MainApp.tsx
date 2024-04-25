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
import { BottomLeftInfo } from './BottomLeftInfo';
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

    const mainController = useMainController(
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
        if (
            process.env.NEXT_PUBLIC_STAGE === 'local' ||
            process.env.NEXT_PUBLIC_STAGE === 'development'
        ) {
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

    const { state, gameIsPlaying, socketController } = mainController;

    return (
        <>
            <TeamMateDisconnectNotification
                teamMateDisconnected={state.mateDisconnected}
                handleClickFindAnotherTeamMate={
                    mainController.handleClickFindAnotherTeamMate
                }
            />
            {!gameIsPlaying && (
                <Menu
                    mainController={mainController}
                    dictionary={dictionary}
                    menuScene={menuScene}
                    nextMenuScene={nextMenuScene}
                    stats={statsRef}
                    refHashMap={refHashMap}
                />
            )}
            {state.gameState && state.loadedLevel && gameIsPlaying && (
                <Game
                    side={state.you.side!}
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
            <BottomLeftInfo
                gameIsPlaying={gameIsPlaying}
                onSettingsClick={handleClickOnSettings}
            />
        </>
    );
}

export default MainApp;
