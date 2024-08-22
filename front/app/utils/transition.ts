// vendors
import { gsap } from 'gsap';
// our libs
// local
import { TweenOptions } from '../Menu/tweens';
import Light from '../Menu/canvas/Light';
import Shadow from '../Menu/canvas/Shadow';

/**
 * Move a graphic side element to coordinates
 */
export function moveSideElementToCoordinate(
    element: Light | Shadow,
    x: number,
    y: number,
    width?: number,
) {
    return gsap.to(element, {
        duration: 0.5,
        delay: 0.1,
        startX: x,
        startY: y,
        ...(width ? { width } : {}),
    });
}

/**
 * Move a graphic side element to a specific step
 */
export function sideElementToStep(
    element: Light | Shadow,
    options: TweenOptions,
    isMobileDevice: boolean,
) {
    const { coordinates, width } = element.getParamsForScene({
        scene: options.step,
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight,
        isMobile: isMobileDevice,
    });
    return moveSideElementToCoordinate(
        element,
        coordinates.x,
        coordinates.y,
        width,
    );
}
