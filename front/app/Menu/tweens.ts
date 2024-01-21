// vendors
import { gsap } from 'gsap';
// our libs
import { Side } from '@benjaminbours/composite-core';
// project
import { MenuScene } from '../types';
import CanvasBlack from './canvas/CanvasBlack';
import CanvasWhite from './canvas/CanvasWhite';
import Curve, { defaultWaveOptions } from './canvas/Curve';
import { RefHashMap } from '../useMenuTransition';

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
 * Light
 */
export function lightToStep(
    options: TweenOptions,
    canvasBlack: CanvasBlack,
    isMobileDevice: boolean,
) {
    const { step, side } = options;
    const coordinate = canvasBlack.light.resizeOptions[step](
        canvasBlack.ctx.canvas.width,
        canvasBlack.ctx.canvas.height,
        isMobileDevice,
        side,
    );

    return gsap.to(canvasBlack.light, {
        duration: 0.5,
        delay: 0.1,
        startX: coordinate.x,
        startY: coordinate.y,
    });
}

/**
 * Shadow
 */
export function shadowToStep(
    options: TweenOptions,
    canvasWhite: CanvasWhite,
    isMobileDevice: boolean,
) {
    const { step, side } = options;
    const coordinate = canvasWhite.shadow.resizeOptions[step](
        canvasWhite.ctx.canvas.width,
        canvasWhite.ctx.canvas.height,
        isMobileDevice,
        side,
    );

    return gsap.to(canvasWhite.shadow, {
        duration: 0.5,
        delay: 0.1,
        startX: coordinate.x,
        startY: coordinate.y,
    });
}

/**
 * Home
 */
function homeOut(homeInterface: HTMLDivElement) {
    return gsap.to('.home-container > *', {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            homeInterface.style.display = 'none';
        },
    });
}

export function homeIn(homeInterface: HTMLDivElement) {
    return gsap.fromTo(
        '.home-container > *',
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

/**
 * Invite friend
 */

function inviteFriendOut(inviteFriendInterface: HTMLDivElement) {
    return gsap.to(inviteFriendInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            inviteFriendInterface.style.display = 'none';
        },
    });
}

export function inviteFriendIn(inviteFriendInterface: HTMLDivElement) {
    return gsap.fromTo(
        inviteFriendInterface,
        {
            opacity: 0,
        },
        {
            duration: 0.5,
            opacity: 1,
            onStart: () => {
                inviteFriendInterface.style.display = 'flex';
            },
        },
    );
}

/**
 * Level
 */
function levelOut(levelInterface: HTMLDivElement) {
    return gsap.to(levelInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            levelInterface.style.display = 'none';
        },
    });
}

export function levelIn(levelInterface: HTMLDivElement) {
    return gsap.fromTo(
        levelInterface,
        {
            opacity: 0,
        },
        {
            duration: 0.5,
            opacity: 1,
            onStart: () => {
                levelInterface.style.display = 'block';
            },
        },
    );
}

/**
 * Faction
 */
function factionOut(factionInterface: HTMLDivElement) {
    return gsap.to(factionInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            factionInterface.style.display = 'none';
        },
    });
}

export function factionIn(factionInterface: HTMLDivElement) {
    return [
        gsap.fromTo(
            factionInterface,
            {
                opacity: 0,
            },
            {
                duration: 0.5,
                opacity: 1,
                onStart: () => {
                    factionInterface.style.display = 'block';
                },
            },
        ),
    ];
}

/**
 * Queue
 */
export function queueIn(queueInterface: HTMLDivElement) {
    return gsap.fromTo(
        queueInterface,
        {
            opacity: 0,
        },
        {
            duration: 0.5,
            opacity: 1,
            onStart: () => {
                queueInterface.style.display = 'block';
            },
        },
    );
}

function queueOut(queueInterface: HTMLDivElement) {
    return gsap.to(queueInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            queueInterface.style.display = 'none';
        },
    });
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
            onComplete: () => {
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
    return [
        homeOut(refHashMap.homeRef.current!),
        levelOut(refHashMap.levelRef.current!),
        factionOut(refHashMap.sideRef.current!),
        queueOut(refHashMap.queueRef.current!),
        endLevelOut(refHashMap.endLevelRef.current!),
        inviteFriendOut(refHashMap.inviteFriendRef.current!),
        notFoundOut(refHashMap.notFoundRef.current!),
        teamLobbyOut(refHashMap.teamLobbyRef.current!),
    ];
}
