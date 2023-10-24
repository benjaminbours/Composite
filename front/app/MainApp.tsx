'use client';
// vendors
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import dynamic from 'next/dynamic';
// our libs
import {
    GameState,
    Levels,
    MatchMakingPayload,
    PositionLevel,
    Side,
    SocketEventType,
} from '@benjaminbours/composite-core';
// local
import type { SocketController } from './SocketController';
import { MenuScene } from './Menu/types';

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

// TODO: Ability to restart a game from the same session without reloading or changing team mate
function MainApp() {
    const socketController = useRef<SocketController>();
    const [menuScene, setMenuScene] = useState<MenuScene>(MenuScene.HOME);
    const [state, setState] = useState<MainState>({
        // side: Side.LIGHT,
        // selectedLevel: Levels.CRACK_THE_DOOR,
        side: undefined,
        selectedLevel: undefined,
        gameState: undefined,
    });
    const [gameIsPlaying, setGameIsPlaying] = useState(false);
    const [tabIsHidden, setTabIsHidden] = useState(false);
    const [isInQueue, setIsInQueue] = useState(false);
    const shouldBeInQueue = useMemo(
        () => state.side !== undefined && state.selectedLevel !== undefined,
        [state],
    );

    const handleGameStart = useCallback((initialGameState: GameState) => {
        setState((prev) => ({ ...prev, gameState: initialGameState }));
        setGameIsPlaying(true);
        setMenuScene(MenuScene.END_LEVEL);
    }, []);

    const handleGameFinished = useCallback(() => {
        setGameIsPlaying(false);
    }, []);

    const establishConnection = useCallback(
        () =>
            import('./SocketController')
                .then((mod) => mod.SocketController)
                .then((SocketController) => {
                    socketController.current = new SocketController(
                        handleGameStart,
                        handleGameFinished,
                    );
                    socketController.current.emit([
                        SocketEventType.MATCHMAKING_INFO,
                        state as MatchMakingPayload,
                    ]);
                    setIsInQueue(true);
                }),
        [handleGameStart, state],
    );

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabIsHidden(true);
            } else {
                setTabIsHidden(false);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, []);

    useEffect(() => {
        if (shouldBeInQueue && !isInQueue) {
            console.log('establish connection');
            establishConnection();
            // establishConnection().then(() => {
            //     const level = new PositionLevel();
            //     const initialGameState = new GameState(
            //         [
            //             {
            //                 position: {
            //                     x: level.startPosition.shadow.x,
            //                     y: level.startPosition.shadow.y,
            //                 },
            //                 velocity: {
            //                     x: 0,
            //                     y: 0,
            //                 },
            //             },
            //             {
            //                 position: {
            //                     x: level.startPosition.light.x,
            //                     y: level.startPosition.light.y,
            //                 },
            //                 velocity: {
            //                     x: 0,
            //                     y: 0,
            //                 },
            //             },
            //         ],
            //         {
            //             ...level.state,
            //             doors: {
            //                 ...level.state.doors,
            //                 ground: [0],
            //                 roof: [0],
            //             },
            //         },
            //         Date.now(),
            //         0,
            //     );
            //     handleGameStart(initialGameState);
            // });
        } else if (isInQueue && !shouldBeInQueue) {
            socketController.current?.destroy();
            socketController.current = undefined;
            setIsInQueue(false);
        }
    }, [shouldBeInQueue, isInQueue, establishConnection]);

    // return (
    //     <>
    //         {/* {!state.isGameRunning && (
    //             <Menu mainState={state} setMainState={setState} />
    //         )} */}
    //         {state.gameState && (
    //             <Game
    //                 initialGameState={state.gameState}
    //                 side={state.side!}
    //                 socketController={socketController.current}
    //                 tabIsHidden={tabIsHidden}
    //             />
    //         )}
    //     </>
    // );

    return (
        <>
            {!gameIsPlaying && (
                <Menu
                    mainState={state}
                    setMainState={setState}
                    menuScene={menuScene}
                    setMenuScene={setMenuScene}
                />
            )}
            {state.gameState && gameIsPlaying && (
                <Game
                    side={state.side!}
                    initialGameState={state.gameState}
                    socketController={socketController.current}
                    tabIsHidden={tabIsHidden}
                />
            )}
        </>
    );
}

export default MainApp;
