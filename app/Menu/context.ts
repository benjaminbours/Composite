import React from 'react';
import { Scene, Side } from './types';

export interface IContext {
    currentScene: Scene;
    side: Side;
    handleMouseEnterPlay: () => void;
    handleMouseLeavePlay: () => void;
    handleClickOnPlay: () => void;
    handleClickOnBack: () => void;
    handleClickOnLevel: (name: string) => void;
    handleClickOnFaction: (side: Side) => void;
}

export const defaultContext: IContext = {
    currentScene: 'home',
    side: 'black',
    handleMouseEnterPlay: () => {
        //
    },
    handleMouseLeavePlay: () => {
        //
    },
    handleClickOnPlay: () => {
        //
    },
    handleClickOnBack: () => {
        //
    },
    handleClickOnLevel: (name: string) => {
        //
    },
    handleClickOnFaction: (side: string) => {
        //
    },
};

export const Context = React.createContext(defaultContext);
