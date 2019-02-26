import * as R from "ramda";
import { MeshBasicMaterial, Mesh, BoxGeometry, Vector3, Material } from "three";

const gridSize = 250;

export const multiplyByGridSize = R.multiply(gridSize);

export function putMeshOnGrid(mesh: Mesh, vec: Vector3): void {
    const coordinate = vec.multiplyScalar(gridSize);
    console.log(coordinate);
    mesh.position.set(
        coordinate.x,
        coordinate.y,
        coordinate.z,
    );
}

export function createMeshForGrid(geometry: BoxGeometry, material: Material): Mesh { 
    geometry.translate(
        geometry.parameters.width / 2,
        geometry.parameters.height / 2,
        geometry.parameters.depth / 2
    );
    return new Mesh(geometry, material);
}

const geometry = new BoxGeometry(
    multiplyByGridSize(1),
    multiplyByGridSize(1),
    multiplyByGridSize(1),
);
const material = new MeshBasicMaterial({ color: 0xffff00 });
export const sizeBox = createMeshForGrid(geometry, material);
