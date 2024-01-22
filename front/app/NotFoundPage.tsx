'use client';
import React, { useContext, useEffect } from 'react';
import { AppContext } from './MainApp';
import { MenuScene } from './types';

interface Props {}

export const NotFoundPage: React.FC<Props> = ({}) => {
    const context = useContext(AppContext);
    useEffect(() => {
        context.setMenuScene(MenuScene.NOT_FOUND);
    }, [context]);
    return <></>;
};
