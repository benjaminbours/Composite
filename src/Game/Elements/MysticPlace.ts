import {
    Object3D,
    Vector3,
    BufferGeometry,
    BufferAttribute,
    ShaderMaterial,
    AdditiveBlending,
    DoubleSide,
    Points,
    Clock,
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
} from "three";
import { getRange } from "../helpers/math";
import { putMeshOnGrid, gridSize } from "../Mesh/Grid";

import VS from "../glsl/mysticPlace_vs.glsl";
import FS from "../glsl/mysticPlace_fs.glsl";
import { TweenLite } from "gsap";

const clock = new Clock();

export class MysticPlace extends Object3D {
    public playerIsOn: boolean = false;
    private isFast: boolean = false;
    private speedModifier: number = 0.5;

    private particles: Points;

    constructor(particlesNumber: number, position?: Vector3) {
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
            particlesDirection[i] = getRange(-directionRange.x, directionRange.x);
            particlesDirection[i + 1] = getRange(-directionRange.y, directionRange.y);
            particlesDirection[i + 2] = getRange(-directionRange.z, directionRange.z);

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

        particlesGeo.addAttribute("position", new BufferAttribute(particlesVertices, 3));
        particlesGeo.addAttribute("direction", new BufferAttribute(particlesDirection, 3));
        particlesGeo.addAttribute("delay", new BufferAttribute(particlesDelay, 1));
        particlesGeo.addAttribute("speed", new BufferAttribute(particlesSpeed, 1));
        particlesGeo.addAttribute("axisRotation", new BufferAttribute(particlesAxisRotation, 3));
        particlesGeo.addAttribute("angle", new BufferAttribute(particlesAngle, 1));
        particlesGeo.addAttribute("size", new BufferAttribute(particlesSize, 1));

        const particlesMat = new ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                opacity: { value: 0.5 },
            },
            vertexShader: VS,
            fragmentShader: FS,
            blending: AdditiveBlending,
            side: DoubleSide,
            transparent: true,
        });

        this.particles = new Points(particlesGeo, particlesMat);
        // this.particles.position.set(0, 30, 0);
        this.add(this.particles);

        const whiteBlockGeo = new BoxGeometry(gridSize / 2, 10, gridSize / 2);
        const whiteBlockmat = new MeshPhongMaterial({ color: 0xFFFFFF, side: DoubleSide, specular: 0x000000, shininess: 50, transparent: true });

        const whiteBlock = new Mesh(whiteBlockGeo, whiteBlockmat);
        this.add(whiteBlock);

        putMeshOnGrid(this, new Vector3(1, 0, 0));

        this.particles.frustumCulled = false;
    }

    public render = () => {
        const delta = clock.getDelta();
        const particlesMat = this.particles.material as ShaderMaterial;
        if (this.playerIsOn && !this.isFast) {
            this.isFast = true;
            TweenLite.to(this, 2, {
                speedModifier: 2.5,
            });
        }

        if (!this.playerIsOn && this.isFast) {
            this.isFast = false;
            TweenLite.to(this, 2, {
                speedModifier: 0.2,
            });
        }
        particlesMat.uniforms.time.value += delta * this.speedModifier;
    }
}
