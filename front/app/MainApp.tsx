'use client';
// vendors
import React, {
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
import * as STATS from 'stats.js';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { SettingsMenu } from './SettingsMenu';
import InputsManager from './Game/Player/InputsManager';
import { BottomLeftInfo } from './BottomLeftInfo';
import { useMainController } from './useMainController';
import { TeamMateDisconnectNotification } from './TeamMateDisconnectNotification';
import { AppContext } from './WithMainApp';
import { getDictionary } from '../getDictionary';
import { useWindowSize } from './hooks/useWindowSize';
import { SideMenu } from './03_organisms/SideMenu';
import { getShouldDisplayHelpOnLoad } from './constants';
import { InGameHelpModal } from './InGameHelpModal';
import { useGlobalContext } from './contexts';

const Menu = dynamic(() => import('./Menu'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

export const MainControllerContext = React.createContext<
    ReturnType<typeof useMainController>
>({} as any);

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

/**
 * MainApp is responsible to manage the orchestration between the Menu (2D part, the queue management, etc), the game (3D part) and the socket connection.
 */
function MainApp({ dictionary }: Props) {
    const {
        isMenuVisible,
        isGameVisible,
        exitGame,
        gameData,
        initialGameState,
        GameComponent,
    } = useGlobalContext();

    const { setMainAppContext } = useContext(AppContext);
    const inputsManager = useRef<InputsManager>(new InputsManager());
    const { width, height } = useWindowSize();
    const isMobile =
        width !== undefined &&
        height !== undefined &&
        (width <= 768 || height <= 500);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tabIsHidden, setTabIsHidden] = useState(false);
    const statsRef = useRef<Stats>();

    // const mateDisconnected = useStoreState(
    //     (state) => state.lobby.mateDisconnected,
    // );

    const handleClickOnSettings = useCallback(() => {
        setIsSettingsOpen(true);
    }, []);

    const handleClickOnCloseSettings = useCallback(() => {
        setIsSettingsOpen(false);
    }, []);

    // effect dedicated to tab switching
    useEffect(() => {
        setMainAppContext({
            // setMenuScene: mainController.setMenuScene,
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

    const [isHelpVisible, setIsHelpVisible] = useState(
        getShouldDisplayHelpOnLoad(),
    );

    // when game is closed, we reset the state of the help modal
    useEffect(() => {
        if (!isGameVisible) {
            setIsHelpVisible(getShouldDisplayHelpOnLoad());
        }
    }, [isGameVisible]);

    return (
        <>
            <TeamMateDisconnectNotification
                teamMateDisconnected={false}
                // teamMateDisconnected={mateDisconnected}
                handleClickFindAnotherTeamMate={
                    () => {}
                    // mainController.handleClickFindAnotherTeamMate
                }
            />
            {isMenuVisible && <Menu dictionary={dictionary} stats={statsRef} />}
            <Suspense>
                {isGameVisible && GameComponent !== undefined && (
                    <GameComponent
                        // side={
                        //     state.you.side === undefined
                        //         ? Side.SHADOW
                        //         : state.you.side
                        // }
                        side={Side.SHADOW}
                        gameData={gameData!}
                        initialGameState={initialGameState}
                        // gameData={{
                        //     socketController:
                        //         servicesContainer.get(SocketController),
                        //     initialGameState,
                        //     lobbyParameters,
                        //     level,
                        //     onPracticeGameFinished: handleGameFinished,
                        // }}
                        tabIsHidden={tabIsHidden}
                        stats={statsRef}
                        inputsManager={inputsManager.current}
                        onExitGame={exitGame}
                    />
                )}
            </Suspense>
            {isSettingsOpen && (
                <SettingsMenu
                    inputsManager={inputsManager.current}
                    onClose={handleClickOnCloseSettings}
                />
            )}
            {!isMobile && (
                <BottomLeftInfo
                    gameIsPlaying={isGameVisible}
                    onSettingsClick={handleClickOnSettings}
                />
            )}
            <div className="top-right-container">
                {isGameVisible && (
                    <>
                        <IconButton
                            className="in-game-help"
                            onClick={() => setIsHelpVisible(true)}
                        >
                            <HelpIcon />
                        </IconButton>
                        <InGameHelpModal
                            isOpen={isHelpVisible}
                            onClose={() => {
                                setIsHelpVisible(false);
                            }}
                            isSoloMode={true}
                        />
                    </>
                )}
                <SideMenu dictionary={dictionary.common} />
            </div>
        </>
    );
}

export default MainApp;
