import * as R from 'ramda';
import { Mesh, BoxGeometry, Vector3, Material, Object3D } from 'three';
import { degreesToRadians } from '../helpers/math';

export const gridSize = 250;

export const multiplyByGridSize = R.multiply(gridSize);

export function positionOnGrid(
    mesh: Mesh | Object3D,
    position: Vector3,
    /**
     * A vector of degrees, example, x: 180, y: 90, z:0
     */
    rotation?: Vector3,
): void {
    const coordinate = position.multiplyScalar(gridSize);
    // console.log(coordinate);
    mesh.position.set(coordinate.x, coordinate.y, coordinate.z);
    if (rotation) {
        const rotationX = degreesToRadians(rotation.x);
        const rotationY = degreesToRadians(rotation.y);
        const rotationZ = degreesToRadians(rotation.z);
        mesh.rotation.set(rotationX, rotationY, rotationZ);
    }
}

// this function center
export function createMeshForGrid(geo: BoxGeometry, mat: Material): Mesh {
    // geo.translate(
    //     geo.parameters.width / 2,
    //     geo.parameters.height / 2,
    //     geo.parameters.depth / 2,
    // );
    const mesh = new Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}
