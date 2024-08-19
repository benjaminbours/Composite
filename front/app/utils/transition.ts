// vendors
import { gsap } from 'gsap';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { TweenOptions } from '../Menu/tweens';
import CanvasBlack from '../Menu/canvas/CanvasBlack';
import CanvasWhite from '../Menu/canvas/CanvasWhite';
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
    canvas: CanvasBlack | CanvasWhite | undefined,
    side: Side,
    options: TweenOptions,
    isMobileDevice: boolean,
) {
    if (canvas === undefined) {
        return;
    }

    const element = (() => {
        if (side === Side.LIGHT) {
            return (canvas as CanvasBlack).light;
        }
        return (canvas as CanvasWhite).shadow;
    })();

    const { coordinates, width } = element.getParamsForScene({
        scene: options.step,
        canvasWidth: canvas.ctx.canvas.width,
        canvasHeight: canvas.ctx.canvas.height,
        isMobile: isMobileDevice,
    });
    return moveSideElementToCoordinate(
        element,
        coordinates.x,
        coordinates.y,
        width,
    );
}
