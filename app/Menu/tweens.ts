import { gsap } from 'gsap';
import Animation from './Animation';
import { app } from '.';

/**
 * Curve
 */
export function curveToStep(step: string) {
    const { canvas, curve } = Animation.canvasComponents;

    return gsap.to(curve, {
        duration: 0.5,
        origin: curve.resizeOptions[step](
            canvas.width,
            canvas.height,
            app.isMobileDevice,
            app.state.faction,
        ),
        onComplete: Animation.setWaveInDefaultMode,
    });
}

/**
 * Light
 */
export function lightToStep(step: string) {
    const { canvas, light } = Animation.canvasComponents;
    const coordinate = light.resizeOptions[step](
        canvas.width,
        canvas.height,
        app.isMobileDevice,
        app.state.faction,
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
export function shadowToStep(step: string) {
    const { canvas, shadow } = Animation.canvasComponents;
    const coordinate = shadow.resizeOptions[step](
        canvas.width,
        canvas.height,
        app.isMobileDevice,
        app.state.faction,
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
export function homeOut() {
    const { mainTitle, subtitleHome } = Animation.canvasComponents;
    const homeInterface = Animation.components.homeInterface
        .current as HTMLDivElement;

    return gsap.to([mainTitle, subtitleHome, homeInterface], {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            mainTitle.onTransition = false;
            mainTitle.isMount = false;

            subtitleHome.onTransition = false;
            subtitleHome.isMount = false;

            homeInterface.style.display = 'none';
        },
    });
}

export function homeIn() {
    const { mainTitle, subtitleHome } = Animation.canvasComponents;
    const homeInterface = Animation.components.homeInterface
        .current as HTMLDivElement;

    return gsap.to([mainTitle, subtitleHome, homeInterface], 0.5, {
        opacity: 1,
        onStart: () => {
            mainTitle.onTransition = true;
            subtitleHome.onTransition = true;

            homeInterface.style.display = 'block';
        },
        onComplete: () => {
            mainTitle.onTransition = false;
            mainTitle.isMount = true;

            subtitleHome.onTransition = false;
            subtitleHome.isMount = true;
        },
    });
}

/**
 * Level
 */
export function levelOut() {
    const levelInterface = Animation.components.levelInterface
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
    const levelInterface = Animation.components.levelInterface
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
export function factionOut() {
    const { titleFaction } = Animation.canvasComponents;
    const factionInterface = Animation.components.factionInterface
        .current as HTMLElement;

    return gsap.to([titleFaction, factionInterface], {
        duration: 0.5,
        opacity: 0,
        onStart: () => {
            titleFaction.onTransition = true;
        },
        onComplete: () => {
            titleFaction.onTransition = false;
            titleFaction.isMount = false;
            factionInterface.style.display = 'none';
        },
    });
}

export function factionIn() {
    const { titleFaction } = Animation.canvasComponents;
    const factionInterface = Animation.components.factionInterface
        .current as HTMLElement;

    return gsap.to([titleFaction, factionInterface], {
        duration: 0.5,
        opacity: 1,
        onStart: () => {
            factionInterface.style.display = 'block';
            titleFaction.onTransition = true;
        },
        onComplete: () => {
            titleFaction.onTransition = false;
            titleFaction.isMount = true;
        },
    });
}

/**
 * Queue
 */
export function queueIn() {
    const queueInterface = Animation.components.queueInterface
        .current as HTMLElement;

    return gsap.to(queueInterface, {
        duration: 0.5,
        opacity: 1,
        onStart: () => {
            queueInterface.style.display = 'block';
        },
    });
}

export function queueOut() {
    const queueInterface = Animation.components.queueInterface
        .current as HTMLElement;

    return gsap.to(queueInterface, {
        duration: 0.5,
        opacity: 0,
        onComplete: () => {
            queueInterface.style.display = 'none';
        },
    });
}
