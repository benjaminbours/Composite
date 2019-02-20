import { Group, BoxGeometry, MeshBasicMaterial, Mesh } from "three";
import { sizeBox } from "./Mesh/Grid";

// Right now, it's a test level
export default class Level extends Group {
    constructor() {
        super();

        const geometry = new BoxGeometry(250, 250, 250);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        const wall = new Mesh(geometry, material);

        // this.add(wall);
        this.add(sizeBox);
    }
}
