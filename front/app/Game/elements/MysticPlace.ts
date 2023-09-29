import {
    Object3D,
    Vector3,
    BufferGeometry,
    BufferAttribute,
    ShaderMaterial,
    AdditiveBlending,
    DoubleSide,
    Points,
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
} from 'three';
import { InteractiveComponent } from '@benjaminbours/composite-core';
import { getRange } from '../helpers/math';
import VS from '../glsl/mysticPlace_vs.glsl';
import FS from '../glsl/mysticPlace_fs.glsl';
import { gsap } from 'gsap';
import { gridSize } from '../levels/levels.utils';

export class MysticPlace extends Object3D implements InteractiveComponent {
    public shouldActivate: boolean = false;
    public isActive: boolean = false;
    protected speedModifier: number = 0.5;
    protected particles: Points;

    constructor(particlesNumber: number, height: number) {
        super();

        // When particlesNumber is multiply by 3, it's because it's an array of vector3 instead of simple floats
        const particlesGeo = new BufferGeometry();
        const particlesVertices = new Float32Array(particlesNumber * 3);
        const particlesDirection = new Float32Array(particlesNumber * 3);
        const particlesDelay = new Float32Array(particlesNumber);
        const particlesSpeed = new Float32Array(particlesNumber);
        const particlesAxisRotation = new Float32Array(particlesNumber * 3);
        const particlesAngle = new Float32Array(particlesNumber);
        const particlesSize = new Float32Array(particlesNumber);

        for (let i = 0; i < particlesVertices.length; i = i + 3) {
            const directionRange = new Vector3(60.0, 40.0, 20.0);
            particlesDirection[i] = getRange(
                -directionRange.x,
                directionRange.x,
            );
            particlesDirection[i + 1] = getRange(
                -directionRange.y,
                directionRange.y,
            );
            particlesDirection[i + 2] = getRange(
                -directionRange.z,
                directionRange.z,
            );

            particlesVertices[i] = 0.0;
            particlesVertices[i + 1] = 0.0;
            particlesVertices[i + 2] = 0.0;

            particlesDelay[i / 3] = getRange(0, 50);
            particlesSpeed[i / 3] = getRange(0.05, 0.5);

            particlesAxisRotation[i] = 0; // x
            particlesAxisRotation[i + 1] = 0; // y
            particlesAxisRotation[i + 2] = 1; // z

            particlesAngle[i / 3] = getRange(1, Math.PI);
            particlesSize[i / 3] = getRange(5.0, 15.0);
        }

        particlesGeo.setAttribute(
            'position',
            new BufferAttribute(particlesVertices, 3),
        );
        particlesGeo.setAttribute(
            'direction',
            new BufferAttribute(particlesDirection, 3),
        );
        particlesGeo.setAttribute(
            'delay',
            new BufferAttribute(particlesDelay, 1),
        );
        particlesGeo.setAttribute(
            'speed',
            new BufferAttribute(particlesSpeed, 1),
        );
        particlesGeo.setAttribute(
            'axisRotation',
            new BufferAttribute(particlesAxisRotation, 3),
        );
        particlesGeo.setAttribute(
            'angle',
            new BufferAttribute(particlesAngle, 1),
        );
        particlesGeo.setAttribute(
            'size',
            new BufferAttribute(particlesSize, 1),
        );

        const particlesMat = new ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                // height: { value: height },
            },
            vertexShader: VS,
            fragmentShader: FS,
            blending: AdditiveBlending,
            side: DoubleSide,
            transparent: true,
        });

        this.particles = new Points(particlesGeo, particlesMat);
        this.add(this.particles);

        const whiteBlockGeo = new BoxGeometry(gridSize / 2, 10, gridSize / 2);
        const whiteBlockMat = new MeshPhongMaterial({
            color: 0xffffff,
            side: DoubleSide,
            specular: 0x000000,
            shininess: 50,
            transparent: true,
        });

        const whiteBlock = new Mesh(whiteBlockGeo, whiteBlockMat);
        this.add(whiteBlock);

        this.particles.frustumCulled = false;
    }

    protected detectActivation = (
        cbActivation?: () => void,
        cbDeactivation?: () => void,
    ) => {
        if (this.shouldActivate && !this.isActive) {
            this.isActive = true;
            if (cbActivation) {
                cbActivation();
            }
        }

        if (!this.shouldActivate && this.isActive) {
            this.isActive = false;
            if (cbDeactivation) {
                cbDeactivation();
            }
        }
    };

    protected activateVFX = () => {
        gsap.to(this, {
            duration: 2,
            speedModifier: 2.5,
        });
    };

    protected deactivateVFX = () => {
        gsap.to(this, {
            duration: 2,
            speedModifier: 0.2,
        });
    };

    protected updateShader = (delta: number) => {
        const particlesMat = this.particles.material as ShaderMaterial;
        particlesMat.uniforms.time.value += delta * this.speedModifier;
    };
}
