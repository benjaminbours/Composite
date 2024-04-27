// vendors
import {
    // AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
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

export interface DoorInfo {
    cameraPosition: Vector3;
    doorLeft: Object3D;
    doorRight: Object3D;
}

const DEFAULT_SPEED_MODIFIER = 0.2;
const FAST_SPEED_MODIFIER = 2;

const DEFAULT_ORGANIC_RATIO = 1;
const FAST_ORGANIC_RATIO = 0.2;

export class DoorOpenerGraphic
    extends Object3D
    implements InteractiveComponent
{
    public shouldActivate: boolean = false;
    public isActive: boolean = false;
    protected speedModifier: number = DEFAULT_SPEED_MODIFIER;
    protected organicRatio = DEFAULT_ORGANIC_RATIO;

    protected particles: Points;
    public doorInfo?: DoorInfo;

    constructor(public name: string) {
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

            particlesSize[i / 3] =
                getRange(5.0, 10.0) * 400 * window.devicePixelRatio;
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

        // each instance should have his own material to isolate material animation
        const particlesMat = new ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                organicRatio: { value: DEFAULT_ORGANIC_RATIO },
            },
            // transparent: true,
            // blending: AdditiveBlending,
            vertexShader: VS,
            fragmentShader: FS,
            name: 'door-opener-material',
        });

        this.particles = new Points(particlesGeo, particlesMat);
        this.particles.name = 'particles';
        this.add(this.particles);
        this.particles.frustumCulled = false;
    }

    // TODO: Think about using a door opening system to manage this logic
    // I don't like the fact its the element door opener who set the camera target
    public update = (delta: number, camera: CustomCamera) => {
        this.detectActivation(this.activate, this.deactivate(camera));
        this.updateShader(delta);
    };

    public focusCamera = (camera: CustomCamera, shouldFocus: boolean) => {
        if (shouldFocus) {
            if (!this.doorInfo) {
                console.log('no door info');
                return;
            }
            camera.focusTarget(
                this.doorInfo.cameraPosition,
                new Vector3(0, 0.2, 0),
            );
        } else {
            camera?.unfocus();
        }
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

    activate = () => {
        this.activateVFX();
    };

    deactivate = (camera: CustomCamera) => () => {
        camera.unfocus();
        this.deactivateVFX();
    };
}
