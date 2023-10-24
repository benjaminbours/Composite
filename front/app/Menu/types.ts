import { Side } from '@benjaminbours/composite-core';

export enum MenuScene {
    HOME = 'home',
    LEVEL = 'level',
    FACTION = 'faction',
    QUEUE = 'queue',
    END_LEVEL = 'end_level',
}

export interface ICoordinate {
    x: number;
    y: number;
}

export interface ResizeOptions {
    isMobileDevice: boolean;
    currentScene: MenuScene;
    side?: Side;
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
