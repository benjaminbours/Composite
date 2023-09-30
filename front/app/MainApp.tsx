'use client';
// vendors
import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
// our libs
import {
    Levels,
    MatchMakingPayload,
    Side,
    SocketEventType,
} from '@benjaminbours/composite-core';
// local
import type { SocketController } from './SocketController';

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
    isGameRunning: boolean;
}

function MainApp() {
    const socketController = useRef<SocketController>();
    const [state, setState] = useState<MainState>({
        // side: Side.SHADOW,
        // selectedLevel: Levels.CRACK_THE_DOOR,
        side: undefined,
        selectedLevel: undefined,
        isGameRunning: false,
    });

    const handleGameStart = useCallback(() => {
        setState((prev) => ({ ...prev, isGameRunning: true }));
    }, []);

    const establishConnection = useCallback(() => {
        return import('./SocketController')
            .then((mod) => mod.SocketController)
            .then((SocketController) => {
                socketController.current = new SocketController(
                    handleGameStart,
                );
                socketController.current.emit([
                    SocketEventType.MATCHMAKING_INFO,
                    state as MatchMakingPayload,
                ]);
            });
    }, [handleGameStart, state]);

    useEffect(() => {
        if (
            state.side === undefined ||
            state.selectedLevel === undefined ||
            // if already exist a socket controller
            //  we are already connect and don't want to connect anymore
            socketController.current
        ) {
            return;
        }

        console.log('establish connection');
        establishConnection();
        // establishConnection().then(() => {
        //     handleGameStart();
        // });
    }, [state, establishConnection]);

    // return (
    //     <>
    //         {/* {!state.isGameRunning && (
    //             <Menu mainState={state} setMainState={setState} />
    //         )}
    //         {state.isGameRunning && ( */}
    //         <Game
    //             selectedLevel={state.selectedLevel!}
    //             side={state.side!}
    //             socketController={socketController.current}
    //         />
    //         {/* )} */}
    //     </>
    // );

    return (
        <>
            {!state.isGameRunning && (
                <Menu mainState={state} setMainState={setState} />
            )}
            {state.isGameRunning && (
                <Game
                    selectedLevel={state.selectedLevel!}
                    side={state.side!}
                    socketController={socketController.current}
                />
            )}
        </>
    );
}

export default MainApp;
