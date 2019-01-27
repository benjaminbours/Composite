import { Power3, TimelineLite, TweenLite } from "gsap";
import Animation from "./Animation";
import { app } from "./App";

/**
 * Curve
 */
export function curveCenter() {
    const { canvas, curve } = Animation.canvasComponents;

    const isMobileDevise = window.innerWidth <= 768;

    return TweenLite.to(curve, 0.5, {
        origin: curve.resizeOptions.faction(canvas.width, canvas.height, isMobileDevise),
        onComplete: Animation.setWaveInDefaultMode,
    });
}

export function curveLevel() {
    const { canvas, curve } = Animation.canvasComponents;

    const isMobileDevise = window.innerWidth <= 768;

    return TweenLite.to(curve, 0.5, {
        origin: curve.resizeOptions.level(canvas.width, canvas.height, isMobileDevise),
        onComplete: Animation.setWaveInDefaultMode,
    });
}

export function curveQueue() {
    const { canvas, curve } = Animation.canvasComponents;

    const isMobileDevise = window.innerWidth <= 768;

    return TweenLite.to(curve, 0.5, {
        origin: curve.resizeOptions.queue(canvas.width, canvas.height, isMobileDevise, app.state.faction),
        onComplete: Animation.setWaveInDefaultMode,
    });
}

// export function curveOutRight() {
//     const { canvas, curve } = Animation.canvasComponents;

//     return TweenLite.to(curve, 0.5, {
//         origin: canvas.width * 1.2,
//         onComplete: Animation.setWaveInDefaultMode,
//     });
// }

/**
 * Queue
 */
export function queueInterfaceIn() {
    const queueInterface = Animation.components.queueInterface.current as HTMLElement;

    return TweenLite.to(queueInterface, 0.5, {
        opacity: 1,
        onStart: () => {
            queueInterface.style.display = "block";
        },
    });
}

export function queueInterfaceOut() {
    const queueInterface = Animation.components.queueInterface.current as HTMLElement;

    return TweenLite.to(queueInterface, 0.5, {
        opacity: 0,
        onComplete: () => {
            queueInterface.style.display = "none";
        },
    });
}

/**
 * Faction
 */
export function titleFactionOut() {
    const { titleFaction } = Animation.canvasComponents;

    return TweenLite.to(titleFaction, 0.5, {
        opacity: 0,
        onStart: () => {
            titleFaction.onTransition = true;
        },
        onComplete: () => {
            titleFaction.onTransition = false;
            titleFaction.isMount = false;
        },
    });
}

export function titleFactionIn() {
    const { titleFaction } = Animation.canvasComponents;

    return TweenLite.to(titleFaction, 0.5, {
        opacity: 1,
        onStart: () => {
            titleFaction.onTransition = true;
        },
        onComplete: () => {
            titleFaction.onTransition = false;
            titleFaction.isMount = true;
        },
    });
}

export function factionInterfaceOut() {
    const factionInterface = Animation.components.factionInterface.current as HTMLElement;

    return TweenLite.to(factionInterface, 0.5, {
        opacity: 0,
        onComplete: () => {
            factionInterface.style.display = "none";
        },
    });
}

export function factionInterfaceIn() {
    const factionInterface = Animation.components.factionInterface.current as HTMLElement;

    return TweenLite.to(factionInterface, 0.5, {
        opacity: 1,
        onStart: () => {
            factionInterface.style.display = "block";
        },
    });
}

/**
 * Level
 */
export function levelInterfaceOut() {
    const levelInterface = Animation.components.levelInterface.current as HTMLElement;

    return TweenLite.to(levelInterface, 0.5, {
        opacity: 0,
        onComplete: () => {
            levelInterface.style.display = "none";
        },
    });
}

/**
 * Light
 */
export function lightOut() {
    const { canvas, light } = Animation.canvasComponents;

    return TweenLite.to(light, 0.5, {
        delay: 0.1,
        startX: canvas.width * -0.5,
    });
}

export function lightCenter() {
    const { canvas, light } = Animation.canvasComponents;

    return TweenLite.to(light, 0.5, {
        delay: 0.1,
        startX: canvas.width * 0.5,
    });
}

export function lightLevel() {
    const { canvas, light } = Animation.canvasComponents;

    return TweenLite.to(light, 0.5, {
        delay: 0.1,
        startX: canvas.width * 0.85,
        startY: canvas.height * 0.5,
    });
}

export function lightFaction() {
    const { canvas, light } = Animation.canvasComponents;

    return TweenLite.to(light, 0.5, {
        delay: 0.1,
        startX: canvas.width * 0.25,
        startY: canvas.height * 0.5,
    });
}

/**
 * Shadow
 */
export function shadowOut() {
    const { canvas, shadow } = Animation.canvasComponents;

    return TweenLite.to(shadow, 0.5, {
        delay: 0.1,
        startX: canvas.width * 1.5,
    });
}

export function shadowCenter() {
    const { canvas, shadow } = Animation.canvasComponents;

    return TweenLite.to(shadow, 0.5, {
        delay: 0.1,
        startX: canvas.width * 0.5,
    });
}

export function shadowLevel() {
    const { canvas, shadow } = Animation.canvasComponents;

    return TweenLite.to(shadow, 0.5, {
        delay: 0.1,
        startX: canvas.width * 0.85,
        startY: canvas.height * 0.5,
    });
}

export function shadowFaction() {
    const { canvas, shadow } = Animation.canvasComponents;

    return TweenLite.to(shadow, 0.5, {
        delay: 0.1,
        startX: canvas.width * 0.75,
        startY: canvas.height * 0.5,
    });
}
