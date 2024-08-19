'use client';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { StoreProvider } from 'easy-peasy';
import MainApp from './MainApp';
import { configureStore } from './core/frameworks';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MenuScene, Route } from './types';
import { useStoreActions } from './hooks';
import { setupProjectEnv } from './utils/setup';
import { getDictionary } from '../getDictionary';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    GlobalContextProvider,
    MenuTransitionContextProvider,
} from './contexts';

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
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
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

export const AppContext = createContext({
    mainAppContext: {} as Record<string, any>,
    setMainAppContext: (ctx: Record<string, any>) => {},
});

function SnackbarCloseButton({ snackbarKey }: any) {
    const { closeSnackbar } = useSnackbar();

    return (
        <IconButton onClick={() => closeSnackbar(snackbarKey)}>
            <CloseIcon />
        </IconButton>
    );
}

export const WithMainApp: React.FC<Props> = ({ children, lng, dictionary }) => {
    const [mainAppContext, setMainAppContext] = useState<Record<string, any>>(
        {},
    );
    const path = usePathname();
    const mainApp = useMemo(() => {
        const pathWithoutLng = path.replace(`/${lng}`, '');
        if (
            pathWithoutLng === '' ||
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
                    case path.includes(Route.LOBBY):
                        return MenuScene.TEAM_LOBBY;
                }
            })();

            return (
                <MenuTransitionContextProvider initialScene={initialScene}>
                    <GlobalContextProvider>
                        <MainApp dictionary={dictionary} />
                    </GlobalContextProvider>
                </MenuTransitionContextProvider>
            );
        }
        return null;
    }, [children, path, lng, dictionary]);

    return (
        <ThemeProvider theme={darkTheme}>
            <SnackbarProvider
                action={(snackbarKey) => (
                    <SnackbarCloseButton snackbarKey={snackbarKey} />
                )}
            >
                <StoreProvider store={store}>
                    <WithRetrieveSession dictionary={dictionary} lng={lng}>
                        <AppContext.Provider
                            value={{
                                mainAppContext,
                                setMainAppContext,
                            }}
                        >
                            {mainApp}
                            {children}
                        </AppContext.Provider>
                    </WithRetrieveSession>
                </StoreProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
};
