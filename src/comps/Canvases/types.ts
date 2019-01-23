import MainTitle from "./comps/MainTitle";
import SubtitleHome from "./comps/SubtitleHome";

export type Components =  MainTitle | SubtitleHome;

export type Side = "black" | "white";

export interface ICoordinate {
    x: number;
    y: number;
}

export interface IWaveOptions {
    viscosity: number;
    mouseDist: number;
    damping: number;
    amplitudeRange: number;
    randomRange: number;
    randomTransition: number;
    amplitudeTransition: number;
    speed: number;
}

export interface Iscenes {
    home: {
        [key: string]: Components;
    };
    faction: {
        [key: string]: Components;
    };
}
