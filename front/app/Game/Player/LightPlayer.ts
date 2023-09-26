import {
    Camera,
    Mesh,
    MeshBasicMaterial,
    PointLight,
    SphereGeometry,
    Vector3,
} from 'three';
import { Player } from './Player';

export class LightPlayer extends Player {
    public mesh: Mesh;

    constructor(public isMainPlayer: boolean) {
        super(isMainPlayer);

        const geometry = new SphereGeometry(5, 32, 32);
        const material = new MeshBasicMaterial({ color: 0xffffff });
        this.mesh = new Mesh(geometry, material);
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        this.add(this.mesh);

        // const pointLight = new PointLight(0x404040, 100, undefined, 0.1);
        const pointLight = new PointLight(0x404040, 80, 600, 0.2);
        pointLight.position.set(0, 20, 0);
        // pointLight.castShadow = true;
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
