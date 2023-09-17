'use client';
import React, { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
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

    const establishConnection = useCallback(() => {
        import('./SocketController')
            .then((mod) => mod.SocketController)
            .then((SocketController) => {
                socketController.current = new SocketController();
            });
    }, []);

    return (
        // <Game />
        <Menu establishConnection={establishConnection} />
    );
}

export default MainApp;
