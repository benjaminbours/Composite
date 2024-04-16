import {
    Object3D,
    Vector3,
    ShaderMaterial,
    Mesh,
    TextureLoader,
    PlaneGeometry,
} from 'three';
import basicVS from '../glsl/basic_postprod_vs.glsl';
import blackHoleFS from '../glsl/black_hole_fs.glsl';
import { Side } from '@benjaminbours/composite-core';

export class BlackHole extends Object3D {
    material: ShaderMaterial;
    constructor(side: Side) {
        super();

        const geometry = new PlaneGeometry(300, 300);
        // each instance should have his own material to isolate material animation
        this.material = new ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                iChannel0: {
                    value: new TextureLoader().load(
                        '/assets/textures/noiseTexture.png',
                    ),
                },
                color: {
                    value:
                        side === Side.LIGHT
                            ? new Vector3(1, 1, 1)
                            : new Vector3(0, 0, 0),
                },
            },
            transparent: true,
            vertexShader: basicVS,
            fragmentShader: blackHoleFS,
            name: 'black-hole-material',
        });

        const mesh = new Mesh(geometry, this.material);
        this.add(mesh);
    }

    update(delta: number) {
        this.rotation.z -= delta;
        this.material.uniforms.time.value += delta;
    }
}
