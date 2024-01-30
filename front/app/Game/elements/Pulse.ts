import {
    Object3D,
    Vector3,
    ShaderMaterial,
    Mesh,
    PlaneGeometry,
    Vector2,
    Camera,
    DoubleSide,
} from 'three';
import basicVS from '../glsl/basic_postprod_vs.glsl';
import pulseFS from '../glsl/pulse_fs.glsl';
import { ElementToBounce } from '@benjaminbours/composite-core';

export class Pulse extends Object3D {
    time = 0;
    material: ShaderMaterial;

    constructor(public bounce: ElementToBounce) {
        super();

        const geometry = new PlaneGeometry(400, 400);
        this.material = new ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                lightPosition: { value: new Vector2(0.5, 0.5) },
            },
            transparent: true,
            side: DoubleSide,
            vertexShader: basicVS,
            fragmentShader: pulseFS,
        });

        const mesh = new Mesh(geometry, this.material);
        this.add(mesh);
        console.log(this.bounce.center);

        this.position.copy(this.bounce.position);
    }

    update(delta: number) {
        this.material.uniforms.time.value += delta;
    }

    get2dLightPosition = (camera: Camera) => {
        const vector = this.localToWorld(this.bounce.center.clone()).project(
            camera,
        );
        const x = (vector.x + 1) / 2;
        const y = (vector.y + 1) / 2;
        return new Vector3(x, y);
    };
}
