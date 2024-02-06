import {
    BoxGeometry,
    DoubleSide,
    Material,
    Mesh,
    MeshPhongMaterial,
    MeshBasicMaterial,
    Object3D,
    Vector3,
    BufferGeometry,
} from 'three';
import {
    computeBoundsTree,
    disposeBoundsTree,
    acceleratedRaycast,
} from 'three-mesh-bvh';
import { degreesToRadians } from '../helpers/math';
import { Layer, Side } from '../types';
import { ElementToBounce } from '../elements';
import { LevelState } from '../GameState';

// Add the extension functions
BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
Mesh.prototype.raycast = acceleratedRaycast;

export const gridSize = 250;
const gridSizeMedium = gridSize / 2;
const gridSizeSmall = gridSizeMedium / 2;
const wallDepth = 34;

export const AREA_DOOR_OPENER_SUFFIX = 'AREA_DOOR_OPENER';

export const ElementName = {
    END_LEVEL: 'END_LEVEL',
    AREA_END_LEVEL: 'AREA_END_LEVEL',
    DOOR_OPENER: (doorName: string) => `${doorName}_DOOR_OPENER`,
    AREA_DOOR_OPENER: (doorName: string) =>
        `${doorName}_${AREA_DOOR_OPENER_SUFFIX}`,
    WALL_DOOR: (doorIndex: string) => `${doorIndex}_WALL_DOOR`,
};

// TODO: Its not clear the fact is instantiated here then populate with more
// geometry later when loading assets. Lets make the loading function return a proper
// loading registry
export const geometries: { [key: string]: any } = {
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
    occlusion: new MeshPhongMaterial({
        color: 0x000000,
        fog: false,
    }),
    skinBounceShadow: new MeshBasicMaterial({
        color: 0x000000,
        fog: false,
        side: DoubleSide,
        // name: 'skin-bounce-shadow',
    }),
    skinBounceLight: new MeshBasicMaterial({
        color: 0xffffff,
        fog: false,
        side: DoubleSide,
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

interface WallOptions {
    size: Vector3;
    position: Vector3;
    rotation: Vector3;
    withOcclusion?: boolean;
    isGeometryCentered?: boolean;
    receiveShadow?: boolean;
}

export function createWall({
    size,
    position,
    rotation,
    withOcclusion,
    isGeometryCentered,
    receiveShadow,
}: WallOptions) {
    const sizeForGrid = size.multiplyScalar(gridSize);
    const geometry = new BoxGeometry(sizeForGrid.x, sizeForGrid.y, wallDepth);

    if (isGeometryCentered) {
        geometry.center();
    } else {
        geometry.translate(sizeForGrid.x / 2, sizeForGrid.y / 2, wallDepth / 2);
    }
    const wall = new Mesh(geometry, materials.phong);
    wall.castShadow = true;
    if (receiveShadow) {
        wall.receiveShadow = true;
    }
    // position the whole group
    positionOnGrid(wall, position, rotation);
    if (withOcclusion) {
        wall.layers.enable(Layer.OCCLUSION);
        // wall.layers.enable(Layer.OCCLUSION_PLAYER);
    }
    return wall;
}

interface WallDoorOptions {
    size: Vector3;
    position: Vector3;
    doorPosition: Vector3;
    orientation: 'horizontal' | 'vertical';
}

export function createWallDoor({
    size,
    position,
    doorPosition,
    orientation,
}: WallDoorOptions) {
    const group = new Object3D();
    // wall left to the door
    const wallLeft = createWall({
        size: new Vector3(1.5, size.y, 0),
        position: new Vector3(0.5, 0, 0),
        rotation: new Vector3(),
    });
    const wallRight = createWall({
        size: new Vector3(0.5, size.y, 0),
        position: new Vector3(-1, 0, 0),
        rotation: new Vector3(),
        // withOcclusion: true,
    });
    group.add(wallLeft, wallRight);

    const createDoor = () => {
        const wallDoor = new Mesh(geometries.wallDoor as any, materials.phong);
        wallDoor.castShadow = true;
        wallDoor.translateY(doorPosition.y * gridSize);
        wallDoor.translateZ(wallDepth / 2);
        const doorLeft = new Mesh(geometries.doorLeft as any, materials.phong);
        doorLeft.castShadow = true;
        doorLeft.translateY(doorPosition.y * gridSize);
        doorLeft.translateZ(wallDepth / 2);
        doorLeft.name = 'doorLeft';
        const doorRight = new Mesh(
            geometries.doorRight as any,
            materials.phong,
        );
        doorRight.castShadow = true;
        doorRight.translateY(doorPosition.y * gridSize);
        doorRight.translateZ(wallDepth / 2);
        doorRight.name = 'doorRight';

        group.add(wallDoor, doorLeft, doorRight);
    };
    // wall (column) center
    // door
    createDoor();
    // below
    if (doorPosition.y > 0) {
        const wall = createWall({
            size: new Vector3(1, doorPosition.y, 0),
            position: new Vector3(-0.5, 0, 0),
            rotation: new Vector3(),
        });
        group.add(wall);
    }
    // top
    const sizeBetweenDoorAndTop = size.y - doorPosition.y;
    if (sizeBetweenDoorAndTop > 0) {
        const wall = createWall({
            size: new Vector3(1, sizeBetweenDoorAndTop - 1, 0),
            position: new Vector3(-0.5, doorPosition.y + 1, 0),
            rotation: new Vector3(),
            // withOcclusion: true,
        });
        group.add(wall);
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

interface ArchGroupOptions {
    height: number;
    position: Vector3;
    withoutColumns?: true;
}

export function createArchGroup({
    height,
    position,
    withoutColumns,
}: ArchGroupOptions) {
    const group = new Object3D();

    if (!withoutColumns) {
        const columnLeft1 = createColumnGroup(height, 'normal');
        const columnLeft2 = createColumnGroup(height, 'normal');
        const columnRight1 = createColumnGroup(height, 'normal', true);
        const columnRight2 = createColumnGroup(height, 'normal', true);

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
    }

    const geometryPlatform = new BoxGeometry(
        gridSize * 1.25,
        10,
        gridSize * 2.5,
    );
    const platformMesh = new Mesh(geometryPlatform, materials.phong);
    platformMesh.castShadow = true;
    // platformMesh.receiveShadow = true;
    platformMesh.name = 'platform';
    const platformMeshOcclusion = new Mesh(
        geometryPlatform,
        materials.occlusion,
    );

    positionOnGrid(platformMesh, new Vector3(0, height, 0));
    group.add(platformMesh);

    platformMeshOcclusion.position.copy(platformMesh.position);
    group.add(platformMeshOcclusion);
    platformMeshOcclusion.layers.set(Layer.OCCLUSION);
    platformMeshOcclusion.layers.enable(Layer.OCCLUSION_PLAYER);

    positionOnGrid(group, position);

    return group;
}

export function createColumnGroup(
    size: number,
    columnGeometry: 'normal' | 'big',
    withOcclusion?: boolean,
) {
    // TODO: Fix this any
    const pedestalGeometry = geometries[
        `column_${columnGeometry}_pedestal`
    ] as BoxGeometry;
    // pedestalGeometry
    const partGeometry = geometries[`column_${columnGeometry}`] as BoxGeometry;
    const group = new Object3D();

    const columnStart = new Mesh(pedestalGeometry, materials.phong);
    columnStart.castShadow = true;
    columnStart.receiveShadow = true;
    group.add(columnStart);
    if (withOcclusion) {
        columnStart.layers.enable(Layer.OCCLUSION);
        columnStart.layers.enable(Layer.OCCLUSION_PLAYER);
    }

    if (partGeometry) {
        const part = new Mesh(partGeometry, materials.phong);
        part.castShadow = true;
        part.receiveShadow = true;
        part.scale.set(1, size - 0.02, 1);
        group.add(part);
        if (withOcclusion) {
            part.layers.enable(Layer.OCCLUSION);
            part.layers.enable(Layer.OCCLUSION_PLAYER);
        }
    }

    const columnEnd = columnStart.clone();
    positionOnGrid(columnEnd, new Vector3(0, size, 0), new Vector3(180, 0, 0));
    group.add(columnEnd);

    return group;
}

export interface BounceDefinition {
    position: Vector3;
    rotationY: number;
    side: Side;
    interactive?: boolean;
}

export function createBounce(
    position: Vector3,
    rotationY: number,
    side: Side,
    id: number,
    interactive: boolean,
) {
    const sizeForGrid = new Vector3(1, 1, 1).multiplyScalar(gridSize / 1.5);
    const positionForGrid = position.multiplyScalar(gridSize);
    const rotation = new Vector3(
        degreesToRadians(90),
        degreesToRadians(90 + rotationY),
        degreesToRadians(0),
    );

    const material = (() => {
        if (side === Side.SHADOW) {
            return materials.skinBounceShadow;
        }
        if (side === Side.LIGHT) {
            return materials.skinBounceLight;
        }
        return materials.phong;
    })();

    const geometry = new BoxGeometry(
        sizeForGrid.x,
        sizeForGrid.y,
        wallDepth,
        30,
        30,
        30,
    );

    const wall = new ElementToBounce(geometry, material, side, id, interactive);

    wall.position.set(positionForGrid.x, positionForGrid.y, positionForGrid.z);
    wall.rotation.set(rotation.x, rotation.y, rotation.z);
    wall.updateMatrix();
    wall.geometry.center();
    wall.geometry.computeBoundingBox();
    wall.geometry.boundingBox?.getCenter(wall.center);
    return wall;
}

export function createMountain() {
    const mountain = new Mesh(geometries.mountain, materials.phong);
    mountain.name = 'mountain';
    positionOnGrid(mountain, new Vector3(0, 0, -30));
    return mountain;
}

export interface AbstractLevel {
    collidingElements: Object3D[];
    name: string;
    startPosition: {
        light: Vector3;
        shadow: Vector3;
    };
    state: LevelState;
    bounces: ElementToBounce[];
    lightBounces: ElementToBounce[];
    updateMatrixWorld(force?: boolean): void;
}
