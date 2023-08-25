import React from 'react';
import dynamic from 'next/dynamic';

const Menu = dynamic(() => import('./Menu'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

const Game = dynamic(() => import('./Game'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

function MainApp() {
    return (
        <Game />
        // <Menu />
    );
}

export default MainApp;
