import { gsap } from 'gsap';
import Animation from './Animation';
import { MenuScene } from './types';

/**
 * Curve
 */
export function curveToStep(step: MenuScene) {
    const { canvas, curve } = Animation.canvasComponents;

    return gsap.to(curve, {
        duration: 0.5,
        origin: curve.resizeOptions[step](
            canvas.width,
            canvas.height,
            Animation.isMobileDevice,
            Animation.faction,
        ),
        onComplete: Animation.setWaveInDefaultMode,
    });
}

/**
 * Light
 */
export function lightToStep(step: MenuScene) {
    const { canvas, light } = Animation.canvasComponents;
    const coordinate = light.resizeOptions[step](
        canvas.width,
        canvas.height,
        Animation.isMobileDevice,
        Animation.faction,
    );

    return gsap.to(light, {
        duration: 0.5,
        delay: 0.1,
        startX: coordinate.x,
        startY: coordinate.y,
    });
}

/**
 * Shadow
 */
export function shadowToStep(step: MenuScene) {
    const { canvas, shadow } = Animation.canvasComponents;
    const coordinate = shadow.resizeOptions[step](
        canvas.width,
        canvas.height,
        Animation.isMobileDevice,
        Animation.faction,
    );

    return gsap.to(shadow, {
        duration: 0.5,
        delay: 0.1,
        startX: coordinate.x,
        startY: coordinate.y,
    });
}

/**
 * Home
 */
function homeOut() {
    const { mainTitle, subtitleHome } = Animation.canvasComponents;
    const homeInterface = Animation.components?.homeInterface
        .current as HTMLDivElement;

    return [
        gsap.to(homeInterface, {
            duration: 0.5,
            opacity: 0,
            onComplete: () => {
                homeInterface.style.display = 'none';
            },
        }),
        gsap.to([mainTitle, subtitleHome], {
            duration: 0.5,
            opacity: 0,
            onComplete: () => {
                mainTitle.onTransition = false;
                mainTitle.isMount = false;
                subtitleHome.onTransition = false;
                subtitleHome.isMount = false;
            },
        }),
    ];
}

export function homeIn() {
    const { mainTitle, subtitleHome } = Animation.canvasComponents;
    const homeInterface = Animation.components?.homeInterface
        .current as HTMLDivElement;

    return [
        gsap.to([mainTitle, subtitleHome], {
            duration: 0.5,
            opacity: 1,
            onStart: () => {
                mainTitle.onTransition = true;
                subtitleHome.onTransition = true;
            },
            onComplete: () => {
                mainTitle.onTransition = false;
                mainTitle.isMount = true;
                subtitleHome.onTransition = false;
                subtitleHome.isMount = true;
            },
        }),
        gsap.to(homeInterface, {
            duration: 0.5,
            opacity: 1,
            onStart: () => {
                homeInterface.style.display = 'block';
            },
        }),
    ];
}

/**
 * Level
 */
function levelOut() {
    const levelInterface = Animation.components?.levelInterface
        .current as HTMLElement;

    return gsap.to(levelInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            levelInterface.style.display = 'none';
        },
    });
}

export function levelIn() {
    const levelInterface = Animation.components?.levelInterface
        .current as HTMLElement;

    return gsap.to(levelInterface, {
        duration: 0.5,
        opacity: 1,
        onStart: () => {
            levelInterface.style.display = 'block';
        },
    });
}

/**
 * Faction
 */
function factionOut() {
    const factionInterface = Animation.components?.factionInterface
        .current as HTMLElement;

    return gsap.to(factionInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            factionInterface.style.display = 'none';
        },
    });
}

export function factionIn() {
    const factionInterface = Animation.components?.factionInterface
        .current as HTMLElement;

    return [
        gsap.to(factionInterface, {
            duration: 0.5,
            opacity: 1,
            onStart: () => {
                factionInterface.style.display = 'block';
            },
        }),
    ];
}

/**
 * Queue
 */
export function queueIn() {
    const queueInterface = Animation.components?.queueInterface
        .current as HTMLElement;

    return gsap.to(queueInterface, {
        duration: 0.5,
        opacity: 1,
        onStart: () => {
            queueInterface.style.display = 'block';
        },
    });
}

function queueOut() {
    const queueInterface = Animation.components?.queueInterface
        .current as HTMLElement;

    return gsap.to(queueInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            queueInterface.style.display = 'none';
        },
    });
}

function endLevelOut() {
    const endLevelInterface = Animation.components?.endLevelInterface
        .current as HTMLElement;

    return gsap.to(endLevelInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            endLevelInterface.style.display = 'none';
        },
    });
}

export function allMenuScenesOut() {
    return [...homeOut(), levelOut(), factionOut(), queueOut(), endLevelOut()];
}
