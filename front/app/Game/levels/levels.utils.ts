import * as R from 'ramda';
import {
    BoxGeometry,
    DoubleSide,
    Material,
    Mesh,
    MeshPhongMaterial,
    Object3D,
    Vector3,
} from 'three';
import { Geometries, GeometriesRegistry } from '../types';
import { degreesToRadians } from '../helpers/math';

export const gridSize = 250;
const gridSizeMedium = gridSize / 2;
const gridSizeSmall = gridSizeMedium / 2;

// TODO: Its not clear the fact is instantiated here then populate with more
// geometry later when loading assets. Lets make the loading function return a proper
// loading registry
export const geometries: GeometriesRegistry = {
    border: new BoxGeometry(100, 10, 100),
    platform: new BoxGeometry(gridSize * 0.65, 10, gridSize * 2.5),
};

const materials = {
    phong: new MeshPhongMaterial({
        color: 0xffffff,
        side: DoubleSide,
        specular: 0x000000,
        shininess: 0,
        transparent: true,
    }),
    border: new MeshPhongMaterial({
        color: 0xffffff,
        side: DoubleSide,
    }),
};

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

function positionInsideGridBox(element: Mesh | Object3D, position: Vector3) {
    const coordinate = position.multiplyScalar(gridSizeSmall);
    element.position.add(coordinate);
}

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

export function createWall(
    size: Vector3,
    position: Vector3,
    rotation: Vector3,
    ambientOcclusionMap?: any,
) {
    const group = new Object3D();

    for (var i = 0; i < size.x; i++) {
        const wallPiece = (() => {
            return createMeshForGrid(geometries.wall as any, materials.phong);
        })();
        positionOnGrid(wallPiece, new Vector3(i, 0, 0));
        group.add(wallPiece);

        if (size.y) {
            for (var j = 1; j < size.y; j++) {
                const wallFloor = createMeshForGrid(
                    geometries.wall as any,
                    materials.phong,
                );
                positionOnGrid(wallFloor, new Vector3(i, j, 0));
                group.add(wallFloor);
            }
        }
    }

    // position the whole group
    positionOnGrid(group, position, rotation);

    return group;
}

export function createArchGroup(
    height: number,
    position: Vector3,
    // goInsideName,
) {
    const group = new Object3D();
    const columnLeft1 = createColumnGroup(height, 'normal');
    const columnLeft2 = createColumnGroup(height, 'normal');
    const columnRight1 = createColumnGroup(height, 'normal');
    const columnRight2 = createColumnGroup(height, 'normal');

    positionOnGrid(columnLeft1, new Vector3(0, 0, -1));
    group.add(columnLeft1);

    positionOnGrid(columnRight1, new Vector3(0, 0, 1));
    group.add(columnRight1);

    positionInsideGridBox(columnLeft1, new Vector3(-1, 0, 0));

    positionOnGrid(columnLeft2, new Vector3(0, 0, -1));
    positionInsideGridBox(columnLeft2, new Vector3(1, 0, 0));
    group.add(columnLeft2);

    positionInsideGridBox(columnRight1, new Vector3(-1, 0, 0));

    positionOnGrid(columnRight2, new Vector3(0, 0, 1));
    positionInsideGridBox(columnRight2, new Vector3(1, 0, 0));
    group.add(columnRight2);

    const geometryPlatform = new BoxGeometry(
        gridSize * 1.25,
        10,
        gridSize * 2.5,
    );
    const platformMesh = createMeshForGrid(geometryPlatform, materials.phong);

    positionOnGrid(platformMesh, new Vector3(0, height, 0));
    group.add(platformMesh);

    positionOnGrid(group, position);

    return group;
}

export function createColumnGroup(
    size: number,
    columnGeometry: 'normal' | 'big',
) {
    // TODO: Fix this any
    const pedestalGeometry = geometries[
        `column_${columnGeometry}_pedestal`
    ] as any;
    const partGeometry = geometries[`column_${columnGeometry}`] as any;
    const group = new Object3D();

    const columnStart = createMeshForGrid(pedestalGeometry, materials.phong);
    group.add(columnStart);

    for (let i = 0; i < size; i++) {
        const part = createMeshForGrid(partGeometry, materials.phong);
        positionOnGrid(part, new Vector3(0, i, 0));
        group.add(part);
    }

    const columnEnd = columnStart.clone();
    positionOnGrid(columnEnd, new Vector3(0, size, 0), new Vector3(180, 0, 0));
    group.add(columnEnd);

    return group;
}
