// vendors
import { gsap } from 'gsap';
// our libs
import { Side } from '@benjaminbours/composite-core';
// project
import { MenuScene } from '../types';
import CanvasBlack from './canvas/CanvasBlack';
import Curve, { defaultWaveOptions } from './canvas/Curve';
import { RefHashMap } from '../contexts/menuTransitionContext';

export interface TweenOptions {
    step: MenuScene;
    side?: Side;
}

/**
 * Curve
 */
export function curveToStep(
    options: TweenOptions,
    canvasBlack: CanvasBlack,
    isMobileDevice: boolean,
) {
    const { step, side } = options;
    return gsap.to(canvasBlack.curve, {
        duration: 0.5,
        origin: canvasBlack.curve.resizeOptions[step](
            canvasBlack.ctx.canvas.width,
            canvasBlack.ctx.canvas.height,
            isMobileDevice,
            side,
        ),
        onComplete: () => {
            Curve.setWaveOptions({
                ...defaultWaveOptions,
            });
        },
    });
}

/**
 * Home
 */
function homeOut(homeInterface: HTMLDivElement) {
    return gsap.to('.home-scene > *', {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            homeInterface.style.display = 'none';
        },
    });
}

export function homeIn(homeInterface: HTMLDivElement) {
    return gsap.fromTo(
        '.home-scene > *',
        {
            opacity: 0,
        },
        {
            duration: 0.5,
            opacity: 1,
            onStart: () => {
                homeInterface.style.display = 'block';
            },
        },
    );
}

function endLevelOut(endLevelInterface: HTMLDivElement) {
    return gsap.to(endLevelInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            endLevelInterface.style.display = 'none';
        },
    });
}

export function teamLobbyIn(teamLobbyInterface: HTMLDivElement) {
    return gsap.fromTo(
        teamLobbyInterface,
        {
            opacity: 0,
        },
        {
            duration: 0.5,
            opacity: 1,
            onStart: () => {
                teamLobbyInterface.style.display = 'flex';
            },
        },
    );
}

function teamLobbyOut(teamLobbyInterface: HTMLDivElement) {
    return gsap.fromTo(
        teamLobbyInterface,
        {
            opacity: 1,
        },
        {
            duration: 0.5,
            opacity: 0,
            onComplete: () => {
                teamLobbyInterface.style.display = 'none';
            },
        },
    );
}

function notFoundOut(notFoundInterface: HTMLDivElement) {
    return gsap.to(notFoundInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            notFoundInterface.style.display = 'none';
        },
    });
}

export function allMenuScenesOut(refHashMap: RefHashMap) {
    const outAnimations = [];
    if (refHashMap.homeRef.current) {
        outAnimations.push(homeOut(refHashMap.homeRef.current));
    }

    if (refHashMap.endLevelRef.current) {
        outAnimations.push(endLevelOut(refHashMap.endLevelRef.current));
    }

    if (refHashMap.notFoundRef.current) {
        outAnimations.push(notFoundOut(refHashMap.notFoundRef.current));
    }

    if (refHashMap.lobbyRef.current) {
        outAnimations.push(teamLobbyOut(refHashMap.lobbyRef.current));
    }

    return outAnimations;
}
