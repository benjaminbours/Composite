// vendors
import { Object3D, ShaderMaterial, Mesh, PlaneGeometry } from 'three';
// our libs
import {
    ElementToBounce,
    degreesToRadians,
} from '@benjaminbours/composite-core';
// project
import { pulseMaterial } from '../materials';

export class Pulse extends Object3D {
    time = 0;
    material: ShaderMaterial;

    constructor(public bounce: ElementToBounce) {
        super();

        const geometry = new PlaneGeometry(400, 400);
        this.material = pulseMaterial;

        const mesh = new Mesh(geometry, this.material);
        this.add(mesh);
        this.rotation.set(degreesToRadians(-90), 0, 0);
    }
}
