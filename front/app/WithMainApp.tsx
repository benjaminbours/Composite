'use client';
import 'reflect-metadata';
import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SnackbarProvider } from 'notistack';
import { StoreProvider } from 'easy-peasy';
import MainApp from './MainApp';
import { configureServices, configureStore } from './core/frameworks';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
            path.includes('/timeline') ||
            path.includes('/level-editor') ||
            path.includes('/login') ||
            path.includes('/register') ||
            path.includes('/sign-up-email-activated') ||
            path.includes('/sign-up-email-validation')
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
