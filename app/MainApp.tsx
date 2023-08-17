import React from 'react';
// import Game from './Game';
import dynamic from 'next/dynamic';

const Menu = dynamic(() => import('./Menu'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
});

function MainApp() {
    return (
        // <Game />
        <Menu />
    );
}

export default MainApp;
