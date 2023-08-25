import * as R from "ramda";
import { MeshBasicMaterial, Mesh, BoxGeometry, Vector3, Material, Object3D } from "three";

export const gridSize = 250;

export const multiplyByGridSize = R.multiply(gridSize);

export function putMeshOnGrid(mesh: Mesh | Object3D, vec: Vector3): void {
    const coordinate = vec.multiplyScalar(gridSize);
    console.log(coordinate);
    mesh.position.set(
        coordinate.x,
        coordinate.y,
        coordinate.z,
    );
}

// this function center
export function createMeshForGrid(geo: BoxGeometry, mat: Material): Mesh {
    geo.translate(
        geo.parameters.width / 2,
        geo.parameters.height / 2,
        geo.parameters.depth / 2,
    );
    return new Mesh(geo, mat);
}

// test purpose
const geometry = new BoxGeometry(
    multiplyByGridSize(1),
    multiplyByGridSize(1),
    multiplyByGridSize(1),
);
const material = new MeshBasicMaterial({ color: 0xffff00 });
export const sizeBox = createMeshForGrid(geometry, material);
