import {
    Object3D,
    BoxGeometry,
    BufferAttribute,
    ShaderMaterial,
    Points,
} from 'three';
import VS from '../glsl/boxShadow_vs.glsl';
import FS from '../glsl/boxShadow_fs.glsl';
import { ElementToBounce, getRange } from '@benjaminbours/composite-core';

export class SkinBounceShadow extends Object3D {
    protected particles: Points;

    constructor(bounce: ElementToBounce) {
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
        if (process.env.NEXT_PUBLIC_STAGE === 'development') {
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

        const material = new ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
            },
            vertexShader: VS,
            fragmentShader: FS,
        });

        this.particles = new Points(bufferGeometry, material);
        this.add(this.particles);
        // TODO: Duplicate with the level utils create bounce logic
        if (bounce.positionApplied) {
            this.position.copy(bounce.positionApplied);
        }
        if (bounce.rotationApplied) {
            this.rotation.set(
                bounce.rotationApplied.x,
                bounce.rotationApplied.y,
                bounce.rotationApplied.z,
            );
        }
        this.updateMatrix();
        bufferGeometry.applyMatrix4(this.matrix);
        bufferGeometry.translate(
            boxParameters.width / 2,
            boxParameters.height / 2,
            0,
        );

        // reset transform
        this.position.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this.scale.set(1, 1, 1);
        this.updateMatrix();
    }

    update(delta: number) {
        const particlesMat = this.particles.material as ShaderMaterial;
        particlesMat.uniforms.time.value += delta;
    }
}
