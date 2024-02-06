// vendors
import {
    Vector3,
    BufferAttribute,
    ShaderMaterial,
    SphereGeometry,
    Points,
    DoubleSide,
    Mesh,
    MeshBasicMaterial,
} from 'three';
// our lib
import { getRange } from '@benjaminbours/composite-core';
// local
import { Player } from './Player';
import VS from '../glsl/playerShadow_vs.glsl';
import FS from '../glsl/playerShadow_fs.glsl';

export class ShadowPlayer extends Player {
    public mesh: Mesh;
    public name = 'shadow-player';
    protected particles: Points;
    private lastPosition = new Vector3();

    constructor() {
        super();

        const geometry = new SphereGeometry(5, 50, 50);
        const particlesNumber = geometry.attributes.position.array.length / 3;
        const shadowDirection = new Float32Array(particlesNumber * 3);
        const shadowDelay = new Float32Array(particlesNumber);
        const shadowSpeed = new Float32Array(particlesNumber);
        const shadowAxisRotation = new Float32Array(particlesNumber * 3);
        const shadowAngle = new Float32Array(particlesNumber);
        const shadowSize = new Float32Array(particlesNumber);
        const shadowSelection = new Float32Array(particlesNumber);

        for (let i = 0; i < shadowDirection.length; i = i + 3) {
            shadowSelection[i / 3] = i;

            let direction = new Vector3(10.0, 10.0, 10.0);

            shadowDirection[i] = getRange(-direction.x, direction.x);
            shadowDirection[i + 1] = getRange(-direction.y, direction.y);
            shadowDirection[i + 2] = getRange(-direction.z, direction.z);

            shadowDelay[i / 3] = getRange(0.0, 1.0);
            shadowSpeed[i / 3] = getRange(0.0, 1.0);

            let xAxisRotation = getRange(0, 1);
            let yAxisRotation = getRange(0, 1);
            let zAxisRotation = getRange(0, 1);

            shadowAxisRotation[i] = xAxisRotation;
            shadowAxisRotation[i + 1] = yAxisRotation;
            shadowAxisRotation[i + 2] = zAxisRotation;

            // create a angle of rotation
            let angle = getRange(1, Math.PI * 2);

            shadowAngle[i / 3] = angle;

            let size = 5.0;

            shadowSize[i / 3] = size;
        }

        geometry.setAttribute(
            'direction',
            new BufferAttribute(shadowDirection, 3),
        );
        geometry.setAttribute('delay', new BufferAttribute(shadowDelay, 1));
        geometry.setAttribute('speed', new BufferAttribute(shadowSpeed, 1));
        geometry.setAttribute(
            'axisRotation',
            new BufferAttribute(shadowAxisRotation, 3),
        );
        geometry.setAttribute('angle', new BufferAttribute(shadowAngle, 1));
        geometry.setAttribute('size', new BufferAttribute(shadowSize, 1));
        geometry.setAttribute(
            'selection',
            new BufferAttribute(shadowSelection, 1),
        );

        const material = new ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                opacity: { value: 0.5 },
                uPowerRotationGlobal: {
                    value: getRange(0.0, 10.0),
                },
                uAngleGlobal: { value: getRange(1, Math.PI) },
                shadowLastPosition: { value: new Vector3(0.5, 0.5, 0.5) },
            },
            vertexShader: VS,
            fragmentShader: FS,
            side: DoubleSide,
            transparent: true,
        });

        this.particles = new Points(geometry, material);
        this.add(this.particles);

        // TODO: check if it can not be added to Player class to avoid duplication
        const basicMaterial = new MeshBasicMaterial({
            color: 0xffffff,
            fog: false,
        });
        this.mesh = new Mesh(geometry, basicMaterial);
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        this.add(this.mesh);
    }

    public update(delta: number) {
        this.lastPosition.add(
            this.lastPosition
                .clone()
                .subVectors(this.position, this.lastPosition)
                .divideScalar(2),
        );

        this.updateShader(this.lastPosition, delta);

        // if (this.states.inside) {
        //     this.shadow.material = this.insideMat;
        // } else {
        //     this.shadow.material = this.shadowMat;
        // }

        // let difference = Math.abs(this.position.x - this.lastPosition.x);
    }

    updateShader(vector: Vector3, delta: number) {
        const mat = this.particles.material as ShaderMaterial;
        if (mat) {
            mat.uniforms.time.value += delta * 2;
            mat.uniforms.shadowLastPosition.value.copy(vector);
        }
    }
}
