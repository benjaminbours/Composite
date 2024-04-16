import { Object3D, BoxGeometry, BufferAttribute, Points } from 'three';
import { ElementToBounce, getRange } from '@benjaminbours/composite-core';
import {
    bounceShadowMaterial,
    bounceShadowMaterialInteractive,
} from '../materials';

export class SkinBounceShadow extends Object3D {
    protected particles: Points;

    constructor(public bounce: ElementToBounce) {
        super();

        const boxParameters = (bounce.geometry as any).parameters;
        const segments = 30;
        // this translate is the same as the one we do when we create wall
        // best way to deal with? I don't think so but, so far so good
        const bufferGeometry = new BoxGeometry(
            boxParameters.width,
            boxParameters.height,
            boxParameters.depth,
            segments,
            segments,
            segments,
        );

        const particlesNumber =
            bufferGeometry.attributes.position.array.length / 3;
        if (process.env.NEXT_PUBLIC_STAGE === 'local') {
            console.log('particlesNumber', particlesNumber);
        }

        const shadowDelay = new Float32Array(particlesNumber);
        const shadowDistance = new Float32Array(particlesNumber);

        for (let i = 0; i < particlesNumber; i++) {
            shadowDelay[i] = getRange(0.0, 1.0);
            shadowDistance[i] = getRange(0.0, 1.0);
        }

        bufferGeometry.setAttribute(
            'delay',
            new BufferAttribute(shadowDelay, 1),
        );
        bufferGeometry.setAttribute(
            'dist',
            new BufferAttribute(shadowDistance, 1),
        );

        const material = this.bounce.interactive
            ? bounceShadowMaterialInteractive
            : bounceShadowMaterial;

        this.particles = new Points(bufferGeometry, material);
        this.particles.name = 'particles';
        this.add(this.particles);
    }
}
