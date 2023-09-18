import { Side } from 'composite-core';

export type Scene = 'home' | 'level' | 'faction' | 'queue';

export interface ICoordinate {
    x: number;
    y: number;
}

export interface ResizeOptions {
    isMobileDevice: boolean;
    currentScene: Scene;
    side: Side;
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
