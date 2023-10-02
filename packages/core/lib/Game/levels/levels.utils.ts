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
import { GeometriesRegistry } from '../types';
import { degreesToRadians } from '../helpers/math';

export const gridSize = 250;
const gridSizeMedium = gridSize / 2;
const gridSizeSmall = gridSizeMedium / 2;
const wallDepth = 34;

// TODO: Its not clear the fact is instantiated here then populate with more
// geometry later when loading assets. Lets make the loading function return a proper
// loading registry
export const geometries: GeometriesRegistry = {
    border: new BoxGeometry(100, 10, 100),
    platform: new BoxGeometry(gridSize * 0.65, 10, gridSize * 2.5),
};

export function addToGeometries(mesh: Mesh) {
    geometries[mesh.name] = mesh.geometry;
}

const materials = {
    phong: new MeshPhongMaterial({
        color: 0xffffff,
        side: DoubleSide,
        // specular: 0x000000,
        // shininess: 0,
        // transparent: true,
    }),
    border: new MeshPhongMaterial({
        color: 0xffffff,
        side: DoubleSide,
    }),
};

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

export function positionInsideGridBox(
    element: Mesh | Object3D,
    position: Vector3,
) {
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
    name?: string,
) {
    const sizeForGrid = size.multiplyScalar(gridSize);
    const wall = createMeshForGrid(
        new BoxGeometry(sizeForGrid.x, sizeForGrid.y, wallDepth).translate(
            sizeForGrid.x / 2,
            sizeForGrid.y / 2,
            wallDepth / 2,
        ),
        materials.phong,
    );
    if (name) {
        wall.name = name;
    }
    // position the whole group
    positionOnGrid(wall, position, rotation);

    return wall;
}

export function createWallDoor(
    size: Vector3,
    position: Vector3,
    doorPosition: Vector3,
    orientation: 'horizontal' | 'vertical',
) {
    const group = new Object3D();
    // wall left to the door
    const wallLeft = createWall(
        new Vector3(1.5, size.y, 0),
        new Vector3(0.5, 0, 0),
        new Vector3(),
    );
    const wallRight = createWall(
        new Vector3(0.5, size.y, 0),
        new Vector3(-1, 0, 0),
        new Vector3(),
    );
    group.add(wallLeft, wallRight);

    for (let i = 0; i < size.y; i++) {
        if (i === doorPosition.y) {
            const wallDoor = createMeshForGrid(
                geometries.wallDoor as any,
                materials.phong,
            );
            wallDoor.translateY(i * gridSize);
            wallDoor.translateZ(wallDepth / 2);
            const doorLeft = createMeshForGrid(
                geometries.doorLeft as any,
                materials.phong,
            );
            doorLeft.translateY(i * gridSize);
            doorLeft.translateZ(wallDepth / 2);
            doorLeft.name = 'doorLeft';
            const doorRight = createMeshForGrid(
                geometries.doorRight as any,
                materials.phong,
            );
            doorRight.translateY(i * gridSize);
            doorRight.translateZ(wallDepth / 2);
            doorRight.name = 'doorRight';

            group.add(wallDoor, doorLeft, doorRight);
        } else {
            const wall = createWall(
                new Vector3(1, 1, 0),
                new Vector3(-0.5, i, 0),
                new Vector3(),
            );
            group.add(wall);
        }
    }

    switch (orientation) {
        case 'horizontal':
            positionOnGrid(group, position, new Vector3(90, 0, -90));
            break;
        case 'vertical':
            positionOnGrid(group, position, new Vector3(0, 90, 0));
            break;
    }

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
