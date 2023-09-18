'use client';
// vendors
import React, { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
// our libs
import { MatchMakingInfo, SocketEventType } from 'composite-core';
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

function MainApp() {
    const socketController = useRef<SocketController>();

    const establishConnection = useCallback((data: MatchMakingInfo) => {
        import('./SocketController')
            .then((mod) => mod.SocketController)
            .then((SocketController) => {
                socketController.current = new SocketController();
                socketController.current.emit([
                    SocketEventType.MATCHMAKING_INFO,
                    data,
                ]);
            });
    }, []);

    return (
        // <Game />
        <Menu establishConnection={establishConnection} />
    );
}

export default MainApp;
