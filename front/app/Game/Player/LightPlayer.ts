import { Camera, Mesh, PointLight, SphereGeometry, Vec2, Vector3 } from 'three';
import { Player } from './Player';
import { playerMeshMaterial } from '../materials';

export class LightPlayer extends Player {
    public mesh: Mesh;
    public name = 'light-player';

    constructor() {
        super();

        const geometry = new SphereGeometry(5, 32, 32);
        this.mesh = new Mesh(geometry, playerMeshMaterial);
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
    // TODO: Duplicate function with element to bounce
    public get2dLightPosition = (camera: Camera, velocity: Vec2) => {
        const p = this.position.clone();
        p.sub(new Vector3(velocity.x / 2, velocity.y / 2, 0));
        const vector = p.project(camera);
        const x = (vector.x + 1) / 2;
        const y = (vector.y + 1) / 2;
        return new Vector3(x, y);
    };
}
