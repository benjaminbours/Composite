// vendors
import {
    // AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    Object3D,
    Points,
    ShaderMaterial,
    Vector3,
} from 'three';
import { gsap } from 'gsap';
// our libs
import {
    getRange,
    type InteractiveComponent,
} from '@benjaminbours/composite-core';
import CustomCamera from '../CustomCamera';
import VS from '../glsl/doorOpener_vs.glsl';
import FS from '../glsl/doorOpener_fs.glsl';

interface DoorInfo {
    cameraPosition: Vector3;
    doorLeft: Object3D;
    doorRight: Object3D;
}

const DEFAULT_SPEED_MODIFIER = 0.2;
const FAST_SPEED_MODIFIER = 2;

const DEFAULT_ORGANIC_RATIO = 1;
const FAST_ORGANIC_RATIO = 0.2;

export class DoorOpener extends Object3D implements InteractiveComponent {
    public shouldActivate: boolean = false;
    public isActive: boolean = false;
    protected speedModifier: number = DEFAULT_SPEED_MODIFIER;
    protected organicRatio = DEFAULT_ORGANIC_RATIO;

    protected particles: Points;

    constructor(
        public name: string,
        public doorInfo: DoorInfo,
        color: Color,
    ) {
        super();
        const particlesNumber = 700;
        // When particlesNumber is multiply by 3, it's because it's an array of vector3 instead of simple floats
        const particlesGeo = new BufferGeometry();
        const particlesVertices = new Float32Array(particlesNumber * 3);
        const particlesDirection = new Float32Array(particlesNumber * 3);
        const particlesDelay = new Float32Array(particlesNumber);
        const particlesSpeed = new Float32Array(particlesNumber);
        const particlesSize = new Float32Array(particlesNumber);

        for (let i = 0; i < particlesVertices.length; i = i + 3) {
            const directionRange = new Vector3(10.0, 10.0, 10.0);
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

            particlesSize[i / 3] = getRange(5.0, 10.0);
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
            'size',
            new BufferAttribute(particlesSize, 1),
        );

        const particlesMat = new ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                color: { value: color },
                organicRatio: { value: DEFAULT_ORGANIC_RATIO },
            },
            // transparent: true,
            // blending: AdditiveBlending,
            vertexShader: VS,
            fragmentShader: FS,
        });

        this.particles = new Points(particlesGeo, particlesMat);
        this.add(this.particles);
        this.particles.frustumCulled = false;
    }

    // TODO: Think about using a door opening system to manage this logic
    // I don't like the fact its the element door opener who set the camera target
    public update = (
        delta: number,
        camera: CustomCamera,
        withFocusCamera: boolean,
    ) => {
        this.detectActivation(
            this.activate(camera, withFocusCamera),
            this.deactivate(camera),
        );
        this.updateShader(delta);
    };

    protected updateShader = (delta: number) => {
        const particlesMat = this.particles.material as ShaderMaterial;
        particlesMat.uniforms.organicRatio.value = this.organicRatio;
        particlesMat.uniforms.time.value += delta * this.speedModifier;
    };

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
            speedModifier: FAST_SPEED_MODIFIER,
        });
        gsap.to(this, {
            delay: 1,
            duration: 5,
            organicRatio: FAST_ORGANIC_RATIO,
        });
    };

    protected deactivateVFX = () => {
        gsap.to(this, {
            duration: 2,
            speedModifier: DEFAULT_SPEED_MODIFIER,
        });
        gsap.to(this, {
            duration: 5,
            delay: 1,
            organicRatio: DEFAULT_ORGANIC_RATIO,
        });
    };

    activate = (camera: CustomCamera, withFocusCamera: boolean) => () => {
        console.log('deactivate');
        if (withFocusCamera) {
            camera.focusTarget(
                this.doorInfo.cameraPosition,
                new Vector3(0, 0.2, 0),
            );
        }
        this.activateVFX();
        this.openTheDoor();
    };

    deactivate = (camera: CustomCamera) => () => {
        console.log('deactivate');

        camera.unfocus();
        this.deactivateVFX();
        this.closeTheDoor();
    };

    openTheDoor = () => {
        gsap.to(this.doorInfo.doorLeft.position, {
            duration: 2,
            x: -100,
            overwrite: true,
        });
        gsap.to(this.doorInfo.doorRight.position, {
            duration: 2,
            x: 100,
            overwrite: true,
        });
    };

    closeTheDoor = () => {
        gsap.to(
            [this.doorInfo.doorLeft.position, this.doorInfo.doorRight.position],
            {
                duration: 0.5,
                x: 0,
                overwrite: true,
            },
        );
    };
}
