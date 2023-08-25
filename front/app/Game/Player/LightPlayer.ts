import { Camera, PointLight, Vector3 } from 'three';
import { Player } from './Player';

export class LightPlayer extends Player {
    constructor() {
        super();
        const pointLight = new PointLight(0x404040, 100, undefined, 0.1);
        pointLight.position.set(0, 20, 0);
        this.add(pointLight);
    }

    // TODO: Rename this function, its unclear
    get2dLightPosition(camera: Camera) {
        // let delta = this.clock.getDelta();

        let p = this.position.clone(),
            // pSphere = this.sphere.position.clone(),
            vector = p.project(camera),
            // vectorSphere = pSphere.project(this.camera),

            x = (vector.x + 1) / 2,
            y = (vector.y + 1) / 2,
            z = (vector.z + 1) / 2;

        return new Vector3(x, y, z);
        // this.volumetricLightUniforms.time.value += delta;
    }
}
