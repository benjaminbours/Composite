'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import MainApp from './MainApp';

interface Props {
    children: React.ReactNode;
}

export const WithMainApp: React.FC<Props> = ({ children }) => {
    const path = usePathname();

    if (path.includes('/timeline')) {
        return children;
    }

    return <MainApp>{children}</MainApp>;
};
