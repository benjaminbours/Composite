'use client';
import 'reflect-metadata';
import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SnackbarProvider } from 'notistack';
import { StoreProvider } from 'easy-peasy';
import MainApp from './MainApp';
import { configureServices, configureStore } from './core/frameworks';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Route } from './types';

configureServices({
    api: {
        origin: process.env.NEXT_PUBLIC_BACKEND_URL!,
    },
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const store = configureStore({});

interface Props {
    children: React.ReactNode;
}

export const WithMainApp: React.FC<Props> = ({ children }) => {
    const path = usePathname();

    const content = useMemo(() => {
        if (
            path.includes(Route.TIMELINE) ||
            path.includes(Route.LEVEL_EDITOR) ||
            path.includes(Route.LOGIN) ||
            path.includes(Route.REGISTER) ||
            path.includes(Route.SIGN_UP_EMAIL_ACTIVATED) ||
            path.includes(Route.SIGN_UP_EMAIL_VALIDATION) ||
            path.includes(Route.NEW_PASSWORD) ||
            path.includes(Route.FORGOT_PASSWORD)
        ) {
            return children;
        }
        return <MainApp>{children}</MainApp>;
    }, [children, path]);

    return (
        <ThemeProvider theme={darkTheme}>
            <SnackbarProvider>
                <StoreProvider store={store}>{content}</StoreProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
};
