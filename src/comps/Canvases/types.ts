import { MainTitle, SubtitleHome, TextDrawer } from "./comps";

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
    home?: {
        // mainTitle: MainTitle;
        title: SubtitleHome;
    };
    faction: {
        title: TextDrawer;
    };
}
