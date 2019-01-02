import ButtonPlay from "./comps/ButtonPlay";
import MainTitle from "./comps/MainTitle";
import Portal from "./comps/Portal";
import TextDrawer from "./comps/TextDrawer";

export type Components = ButtonPlay | MainTitle | TextDrawer | Portal;

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
    level: {
        [key: string]: Components;
    };
}
