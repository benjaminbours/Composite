import React from "react";

export interface IState {
    currentScene: "home" | "level" | "faction" | "queue";
    faction: "light" | "shadow";
    handleMouseEnterPlay: () => void;
    handleMouseLeavePlay: () => void;
    handleClickOnPlay: () => void;
    handleClickOnBack: () => void;
    handleClickOnLevel: (name: string) => void;
    handleClickOnFaction: (side: string) => void;
}

export const defaultState: IState = {
    currentScene: "home",
    faction: "shadow",
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

export const Context = React.createContext(defaultState);
