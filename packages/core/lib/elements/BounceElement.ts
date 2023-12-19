import { Mesh, Object3D, Vector3 } from 'three';
import { createWall } from '../levels';

export class ElementToBounce extends Object3D {
    public bounce = true;

    constructor() {
        super();

        const wall = createWall(
            new Vector3(1, 1, 0),
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
        );
        wall.receiveShadow = true;
        wall.castShadow = true;

        this.add(wall);
        // if (faction === 'light') {
        //     this.bounceShadow = false;
        //     this.bounceLight = true;
        // } else {
        //     this.bounceShadow = true;
        //     this.bounceLight = false;
        //     this.material.color.set(0x000000);
        // }
    }

    // createBBox() {
    //     this.bbox = new THREE.Box3().setFromObject(this);
    // }

    // get2dPosition(camera) {
    //     // let delta = this.clock.getDelta();

    //     let p = this.position.clone(),
    //         // pSphere = this.sphere.position.clone(),
    //         vector = p.project(camera),
    //         // vectorSphere = pSphere.project(this.camera),

    //         x = (vector.x + 1) / 2,
    //         y = (vector.y + 1) / 2,
    //         z = (vector.z + 1) / 2;

    //     return new THREE.Vector3(x, y, z);
    //     // this.volumetricLightUniforms.time.value += delta;
    // }
}
