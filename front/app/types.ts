import { LevelStatusEnum } from '@benjaminbours/composite-api-client';
import { Side } from '@benjaminbours/composite-core';

export enum MenuScene {
    HOME = 'home',
    END_LEVEL = 'end_level',
    TEAM_LOBBY = 'team_lobby',
    TEAM_LOBBY_SELECTED = 'team_lobby_selected',
    NOT_FOUND = 'not_found',
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

export const Route = {
    HOME: '/',
    LOBBY: '/lobby',
    LOBBY_LEVEL: (levelId: number) => `/lobby?level=${levelId}`,
    SHARE: (levelId?: number) => `/share/${levelId}`,
    COMMUNITY: '/community',
    COMMUNITY_LEVEL: (levelId: number) => `/community/levels/${levelId}`,
    TIMELINE: '/timeline',
    ROADMAP: '/timeline#roadmap',
    LEVEL_EDITOR_ROOT: '/level-editor',
    LEVEL_EDITOR: (levelId: number | string) => `/level-editor/${levelId}`,
    LOGIN: '/login',
    REGISTER: '/register',
    SIGN_UP_EMAIL_VALIDATION: '/sign-up-email-validation',
    SIGN_UP_EMAIL_ACTIVATED: '/sign-up-email-activated',
    FORGOT_PASSWORD: '/forgot-password',
    NEW_PASSWORD: '/new-password',

    NOT_FOUND: '/not-found',
};

export interface PartialLevel {
    id: number;
    name: string;
    data: any;
    status: LevelStatusEnum;
    lightStartPosition: number[];
    shadowStartPosition: number[];
}
