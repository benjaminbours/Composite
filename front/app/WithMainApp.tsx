'use client';
import React, { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SnackbarProvider } from 'notistack';
import { StoreProvider } from 'easy-peasy';
import MainApp from './MainApp';
import { configureStore } from './core/frameworks';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MenuScene, Route } from './types';
import { useStoreActions } from './hooks';
import { setupProjectEnv } from './utils/setup';

setupProjectEnv('client');

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const store = configureStore({});

interface Props {
    children: React.ReactNode;
    lng: string;
}

const WithRetrieveSession: React.FC<Props> = ({ children }) => {
    const retrieveSession = useStoreActions(
        (actions) => actions.user.retrieveSession,
    );

    useEffect(() => {
        retrieveSession();
    }, [retrieveSession]);

    return children;
};

export const WithMainApp: React.FC<Props> = ({ children, lng }) => {
    const path = usePathname();
    const mainApp = useMemo(() => {
        const pathWithoutLng = path.replace(`/${lng}`, '');
        if (
            pathWithoutLng === '' ||
            path.includes(Route.INVITE) ||
            path.includes(Route.LOBBY) ||
            (children as any).props.notFound
        ) {
            console.log('render main app');
            const initialScene = (() => {
                switch (true) {
                    // case Boolean((children as any).props.notFound):
                    //     return MenuScene.NOT_FOUND;
                    case pathWithoutLng === '':
                        return MenuScene.HOME;
                    case path.includes(Route.INVITE):
                        return MenuScene.INVITE_FRIEND;
                    case path.includes(Route.LOBBY):
                        return MenuScene.TEAM_LOBBY;
                }
            })();

            return <MainApp initialScene={initialScene} />;
        }
        return null;
    }, [children, path, lng]);

    return (
        <ThemeProvider theme={darkTheme}>
            <SnackbarProvider>
                <StoreProvider store={store}>
                    <WithRetrieveSession lng={lng}>
                        {mainApp}
                        {children}
                    </WithRetrieveSession>
                </StoreProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
};
