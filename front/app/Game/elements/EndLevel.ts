// vendors
import {
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
    type InteractiveComponent,
    getRange,
} from '@benjaminbours/composite-core';
// local
import CustomCamera from '../CustomCamera';
import VS from '../glsl/endLevel_vs.glsl';
import FS from '../glsl/endLevel_fs.glsl';

const DEFAULT_SPEED_MODIFIER = 0.2;
const FAST_SPEED_MODIFIER = 2;

const DEFAULT_ORGANIC_RATIO = 0;
const FAST_ORGANIC_RATIO = 1;

// TODO: shouldActive and activate are not used anymore because we need dedicated one
// for each player here
// TODO: Naming can be improved as well, organic ratio is not correct in this context
// its more an interpolation ratio
export class EndLevel extends Object3D implements InteractiveComponent {
    public shouldActivate = false;
    public shouldActivateLight = false;
    public shouldActivateShadow = false;
    public isActive = false;
    public isActiveLight = false;
    public isActiveShadow = false;
    protected speedModifier = DEFAULT_SPEED_MODIFIER;
    protected organicRatioLight = DEFAULT_ORGANIC_RATIO;
    protected organicRatioShadow = DEFAULT_ORGANIC_RATIO;

    protected particles: Points;

    constructor() {
        super();
        const particlesNumber = 1000;
        // When particlesNumber is multiply by 3, it's because it's an array of vector3 instead of simple floats
        const particlesGeo = new BufferGeometry();
        const particlesVertices = new Float32Array(particlesNumber * 3);
        const particlesDirection = new Float32Array(particlesNumber * 3);
        const particlesAxisRotation = new Float32Array(particlesNumber * 3);
        const particlesDelay = new Float32Array(particlesNumber);
        const particlesAngleRotation = new Float32Array(particlesNumber);
        const particlesSpeed = new Float32Array(particlesNumber);
        const particlesSize = new Float32Array(particlesNumber);

        for (let i = 0; i < particlesVertices.length; i = i + 3) {
            const range = 300;
            const directionRange = new Vector3(range, range, range);
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

            particlesAxisRotation[i] = getRange(0, 1); // x
            particlesAxisRotation[i + 1] = getRange(0, 1); // y
            particlesAxisRotation[i + 2] = getRange(0, 1); // z

            particlesDelay[i / 3] = getRange(0, 50);
            particlesSpeed[i / 3] = getRange(0.05, 0.5);

            particlesSize[i / 3] = getRange(5.0, 10.0);
            particlesAngleRotation[i / 3] = getRange(0, Math.PI * 2);
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
            'axisRotation',
            new BufferAttribute(particlesAxisRotation, 3),
        );
        particlesGeo.setAttribute(
            'angleRotation',
            new BufferAttribute(particlesAngleRotation, 1),
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
                organicRatioLight: { value: DEFAULT_ORGANIC_RATIO },
                organicRatioShadow: { value: DEFAULT_ORGANIC_RATIO },
            },
            vertexShader: VS,
            fragmentShader: FS,
        });

        this.particles = new Points(particlesGeo, particlesMat);
        this.add(this.particles);

        this.particles.frustumCulled = false;
    }

    public update = (delta: number, camera: CustomCamera) => {
        this.detectActivation(this.activate(camera), this.deactivate(camera));
        this.updateShader(delta);
    };

    protected updateShader = (delta: number) => {
        const particlesMat = this.particles.material as ShaderMaterial;
        particlesMat.uniforms.organicRatioLight.value = this.organicRatioLight;
        particlesMat.uniforms.organicRatioShadow.value =
            this.organicRatioShadow;
        particlesMat.uniforms.time.value += delta * this.speedModifier;
    };

    protected detectActivation = (
        cbActivation?: (side: 'shadow' | 'light') => void,
        cbDeactivation?: (side: 'shadow' | 'light') => void,
    ) => {
        // activations
        if (this.shouldActivateShadow && !this.isActiveShadow) {
            this.isActiveShadow = true;

            if (cbActivation) {
                cbActivation('shadow');
            }
        }

        if (this.shouldActivateLight && !this.isActiveLight) {
            this.isActiveLight = true;
            if (cbActivation) {
                cbActivation('light');
            }
        }

        // deactivations
        if (!this.shouldActivateShadow && this.isActiveShadow) {
            this.isActiveShadow = false;
            if (cbDeactivation) {
                cbDeactivation('shadow');
            }
        }

        if (!this.shouldActivateLight && this.isActiveLight) {
            this.isActiveLight = false;
            if (cbDeactivation) {
                cbDeactivation('light');
            }
        }
    };

    protected activateShadow = () => {
        gsap.to(this, {
            delay: 1,
            duration: 5,
            organicRatioShadow: FAST_ORGANIC_RATIO,
        });
    };

    protected activateLight = () => {
        gsap.to(this, {
            delay: 1,
            duration: 5,
            organicRatioLight: FAST_ORGANIC_RATIO,
        });
    };

    protected deactivateShadow = () => {
        gsap.to(this, {
            duration: 5,
            delay: 1,
            organicRatioShadow: DEFAULT_ORGANIC_RATIO,
        });
    };

    protected deactivateLight = () => {
        gsap.to(this, {
            duration: 5,
            delay: 1,
            organicRatioLight: DEFAULT_ORGANIC_RATIO,
        });
    };

    activate = (camera: CustomCamera) => (side: 'shadow' | 'light') => {
        // camera.focusTarget(
        //     this.doorInfo.cameraPosition,
        //     new Vector3(0, 0.2, 0),
        // );
        if (side === 'shadow') {
            this.activateShadow();
        } else {
            this.activateLight();
        }
        // this.openTheDoor();
    };

    deactivate = (camera: CustomCamera) => (side: 'shadow' | 'light') => {
        // camera.unfocus();
        // this.deactivateVFX();
        if (side === 'shadow') {
            this.deactivateShadow();
        } else {
            this.deactivateLight();
        }
        // this.closeTheDoor();
    };

    // openTheDoor = () => {
    //     gsap.to(this.doorInfo.doorLeft.position, {
    //         duration: 2,
    //         x: -100,
    //         overwrite: true,
    //     });
    //     gsap.to(this.doorInfo.doorRight.position, {
    //         duration: 2,
    //         x: 100,
    //         overwrite: true,
    //     });
    // };

    // closeTheDoor = () => {
    //     gsap.to(
    //         [this.doorInfo.doorLeft.position, this.doorInfo.doorRight.position],
    //         {
    //             duration: 0.5,
    //             x: 0,
    //             overwrite: true,
    //         },
    //     );
    // };
}
