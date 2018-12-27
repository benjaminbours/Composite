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
