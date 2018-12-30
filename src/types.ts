import ButtonPlay from "./comps/ButtonPlay";
import MainTitle from "./comps/MainTitle";
import TextDrawer from "./comps/TextDrawer";

export type Side = "black" | "white";

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

export type Components = ButtonPlay | MainTitle | TextDrawer;
