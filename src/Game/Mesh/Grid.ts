import * as R from "ramda";
import { MeshBasicMaterial, Mesh, BoxGeometry, Vector3 } from "three";

const gridSize = 250;

// helpers putMeshOnGrid
const multiplyByGridSize = R.multiply(gridSize);

function putMeshOnGrid(mesh: Mesh, coordinate: Vector3): void {
    const { width } = (mesh.geometry as any).parameters;

    const setupForGrid = R.pipe(
        multiplyByGridSize,
        R.add(width / 2),
    );

    mesh.position.set(
        setupForGrid(coordinate.x),
        setupForGrid(coordinate.y - 1),
        setupForGrid(coordinate.z - 1),
    );
}

const geometry = new BoxGeometry(
    multiplyByGridSize(3),
    multiplyByGridSize(3),
    multiplyByGridSize(2),
);
const material = new MeshBasicMaterial({ color: 0xffff00 });
export const sizeBox = new Mesh(geometry, material);

putMeshOnGrid(sizeBox, new Vector3(0, 0, -1));

// write a unit test to test if the grid is well designed
