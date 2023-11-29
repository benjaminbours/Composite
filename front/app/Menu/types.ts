import { Side } from '@benjaminbours/composite-core';

export enum MenuScene {
    HOME = 'home',
    LEVEL = 'level',
    FACTION = 'faction',
    QUEUE = 'queue',
    END_LEVEL = 'end_level',
}

export enum MenuMode {
    // basically, when not in queue
    DEFAULT = 'DEFAULT',
    // when you are already connected by websocket, and with a team mate
    // After you finished the first level and you want to play another one with your friend.
    // or if you have invited a team mate by link (coming soon feature)
    IN_TEAM = 'IN_TEAM',
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
