import {
    BoxGeometry,
    DoubleSide,
    Mesh,
    MeshPhongMaterial,
    MeshBasicMaterial,
    Object3D,
    Vector3,
    BufferGeometry,
    Group,
    Object3DEventMap,
    Euler,
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
    BOUNCE: (side: Side) => `${side}_BOUNCE`,
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
    rotation?: Euler,
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

// TODO: Check to remove / merge it with WallProperties
interface WallOptions {
    size: Vector3;
    position: Vector3;
    rotation: Euler;
    withOcclusion?: boolean;
    isGeometryCentered?: boolean;
    receiveShadow?: boolean;
}

// TODO: detect if some walls are occluding the player
// TODO: detect if some walls could potentially collide with the player
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
    const wallGroup = new Group();
    wallGroup.add(wall);
    // position the whole group
    if (withOcclusion) {
        const wallOcclusion = wall.clone();
        wallOcclusion.material = materials.occlusion;
        wallOcclusion.layers.set(Layer.OCCLUSION);
        wallOcclusion.layers.enable(Layer.OCCLUSION_PLAYER);
        wallGroup.add(wallOcclusion);
    }

    positionOnGrid(wallGroup, position, rotation);
    return wallGroup;
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
        rotation: new Euler(),
        withOcclusion: true,
    });
    const wallRight = createWall({
        size: new Vector3(0.5, size.y, 0),
        position: new Vector3(-1, 0, 0),
        rotation: new Euler(),
        withOcclusion: true,
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

        // occlusion
        const doorLeftOcclusion = doorLeft.clone();
        doorLeftOcclusion.name = '';
        doorLeftOcclusion.material = materials.occlusion;
        doorLeftOcclusion.layers.set(Layer.OCCLUSION);
        doorLeftOcclusion.layers.enable(Layer.OCCLUSION_PLAYER);
        group.add(doorLeftOcclusion);

        const doorRightOcclusion = doorRight.clone();
        doorRightOcclusion.name = '';
        doorRightOcclusion.material = materials.occlusion;
        doorRightOcclusion.layers.set(Layer.OCCLUSION);
        doorRightOcclusion.layers.enable(Layer.OCCLUSION_PLAYER);
        group.add(doorRightOcclusion);

        const wallDoorOcclusion = wallDoor.clone();
        wallDoorOcclusion.name = '';
        wallDoorOcclusion.material = materials.occlusion;
        wallDoorOcclusion.layers.set(Layer.OCCLUSION);
        wallDoorOcclusion.layers.enable(Layer.OCCLUSION_PLAYER);
        group.add(wallDoorOcclusion);

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
            rotation: new Euler(),
            withOcclusion: true,
        });
        group.add(wall);
    }
    // top
    const sizeBetweenDoorAndTop = size.y - doorPosition.y;
    if (sizeBetweenDoorAndTop > 0) {
        const wall = createWall({
            size: new Vector3(1, sizeBetweenDoorAndTop - 1, 0),
            position: new Vector3(-0.5, doorPosition.y + 1, 0),
            rotation: new Euler(),
            withOcclusion: true,
        });
        group.add(wall);
    }
    switch (orientation) {
        case 'horizontal':
            positionOnGrid(group, position, new Euler(90, 0, -90));
            break;
        case 'vertical':
            positionOnGrid(group, position, new Euler(0, 90, 0));
            break;
    }

    return group;
}

// TODO: Check to remove / merge it with ArchGroupProperties
interface ArchGroupOptions {
    size: Vector3;
    position: Vector3;
    withoutColumns?: true;
}

export function createArchGroup({
    size,
    position,
    withoutColumns,
}: ArchGroupOptions) {
    const group = new Object3D();

    if (!withoutColumns) {
        const columnGroup = new Object3D();
        group.add(columnGroup);

        const columnBackRight = createColumnGroup(size.y, 'normal');
        const columnBackLeft = createColumnGroup(size.y, 'normal');
        const columnFrontRight = createColumnGroup(size.y, 'normal', true);
        const columnFrontLeft = createColumnGroup(size.y, 'normal', true);
        // back pair
        columnGroup.add(columnBackRight);
        columnGroup.add(columnBackLeft);
        // front pair
        columnGroup.add(columnFrontRight);
        columnGroup.add(columnFrontLeft);

        const internalColumnPosition = 0.25;
        positionOnGrid(
            columnBackRight,
            new Vector3(-internalColumnPosition, 0, -1),
        );
        positionOnGrid(
            columnBackLeft,
            new Vector3(internalColumnPosition, 0, -1),
        );
        positionOnGrid(
            columnFrontRight,
            new Vector3(-internalColumnPosition, 0, 1),
        );
        positionOnGrid(
            columnFrontLeft,
            new Vector3(internalColumnPosition, 0, 1),
        );
        if (size.x >= 2) {
            // position left group
            columnGroup.position.set(
                (-size.x / 2) * gridSize + 0.5 * gridSize,
                0,
                0,
            );
            // position right group
            const rightGroup = columnGroup.clone();
            rightGroup.position.set(
                (size.x / 2) * gridSize - 0.5 * gridSize,
                0,
                0,
            );
            group.add(rightGroup);
        }
    }

    const geometryPlatform = new BoxGeometry(
        // gridSize * 1.25 * size.x,
        gridSize * size.x,
        10,
        gridSize * 2.5,
    );
    const platformMesh = new Mesh(geometryPlatform, materials.phong);
    platformMesh.castShadow = true;
    // platformMesh.receiveShadow = true;
    platformMesh.name = 'platform';
    // position the height of the platform only
    positionOnGrid(platformMesh, new Vector3(0, size.y, 0));
    group.add(platformMesh);

    // occlusion management
    const platformMeshOcclusion = new Mesh(
        geometryPlatform,
        materials.occlusion,
    );
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

    if (partGeometry) {
        const part = new Mesh(partGeometry, materials.phong);
        part.castShadow = true;
        part.receiveShadow = true;
        part.scale.set(1, size - 0.02, 1);
        group.add(part);
    }

    const columnEnd = columnStart.clone();
    positionOnGrid(columnEnd, new Vector3(0, size, 0), new Euler(180, 0, 0));
    group.add(columnEnd);

    if (withOcclusion) {
        const columnStartOcclusion = columnStart.clone();
        columnStartOcclusion.material = materials.occlusion;
        columnStartOcclusion.layers.set(Layer.OCCLUSION);
        columnStartOcclusion.layers.enable(Layer.OCCLUSION_PLAYER);
        group.add(columnStartOcclusion);

        const columnEndOcclusion = columnEnd.clone();
        columnEndOcclusion.material = materials.occlusion;
        columnEndOcclusion.layers.set(Layer.OCCLUSION);
        columnEndOcclusion.layers.enable(Layer.OCCLUSION_PLAYER);
        group.add(columnEndOcclusion);

        if (partGeometry) {
            const partOcclusion = new Mesh(partGeometry, materials.occlusion);
            partOcclusion.layers.set(Layer.OCCLUSION);
            partOcclusion.layers.enable(Layer.OCCLUSION_PLAYER);
            group.add(partOcclusion);
        }
    }

    return group;
}

export interface BounceOptions {
    size: Vector3;
    position: Vector3;
    rotation: Euler;
    side: Side;
    id: number;
    interactive: boolean;
}

export function createBounce({
    size,
    position,
    rotation,
    side,
    id,
    interactive,
}: BounceOptions) {
    const sizeForGrid = new Vector3(1, 1, 1).multiplyScalar(gridSize / 1.5);
    const positionForGrid = position.multiplyScalar(gridSize);

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
    wall.rotation.set(
        degreesToRadians(rotation.x),
        degreesToRadians(rotation.y),
        degreesToRadians(rotation.z),
    );
    wall.updateMatrix();
    wall.geometry.center();
    wall.geometry.computeBoundingBox();
    wall.geometry.boundingBox?.getCenter(wall.center);
    wall.name = ElementName.BOUNCE(side);
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
    doors: {
        wall: Object3D<Object3DEventMap>;
        openerPosition: Vector3;
    }[];
    bounces: ElementToBounce[];
    lightBounces: ElementToBounce[];
    updateMatrixWorld(force?: boolean): void;
}
