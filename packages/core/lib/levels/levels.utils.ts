import {
    BoxGeometry,
    DoubleSide,
    Mesh,
    MeshPhongMaterial,
    MeshBasicMaterial,
    Object3D,
    Vector3,
    Group,
    Object3DEventMap,
    Euler,
    Box3,
    PlaneGeometry,
} from 'three';
import { degreesToRadians } from '../helpers/math';
import { Layer, Side } from '../types';
import { ElementToBounce, InteractiveArea } from '../elements';
import { LevelState } from '../GameState';
import {
    ArchProperties,
    BounceProperties,
    ColumnFatProperties,
    DoorOpenerProperties,
    ElementProperties,
    ElementType,
    EndLevelProperties,
    LevelElement,
    WallDoorProperties,
    WallProperties,
} from './types';

export const gridSize = 250;
const wallDepth = 34;

export const AREA_DOOR_OPENER_SUFFIX = 'AREA_DOOR_OPENER';

export const ElementName = {
    END_LEVEL: 'END_LEVEL',
    AREA_END_LEVEL: 'AREA_END_LEVEL',
    DOOR_OPENER: (doorId: string) => `${doorId}_DOOR_OPENER`,
    AREA_DOOR_OPENER: (doorId: string, openerId: string) =>
        `${doorId}_${openerId}_${AREA_DOOR_OPENER_SUFFIX}`,
    BOUNCE: (id: string) => `${id}_BOUNCE`,
    WALL_DOOR: (doorIndex: string) => `${doorIndex}_WALL_DOOR`,
};

// TODO: Its not clear the fact is instantiated here then populate with more
// geometry later when loading assets. Lets make the loading function return a proper
// loading registry
export const geometries: { [key: string]: any } = {
    border: new BoxGeometry(100, 10, 100),
};

export const materials = {
    phong: new MeshPhongMaterial({
        color: 0xffffff,
        side: DoubleSide,
        name: 'default-phong',
        // specular: 0x000000,
        // shininess: 0,
        // transparent: true,
    }),
    occlusion: new MeshPhongMaterial({
        color: 0x000000,
        fog: false,
        name: 'occlusion',
    }),
    skinBounceShadow: new MeshBasicMaterial({
        color: 0x000000,
        fog: false,
        side: DoubleSide,
        name: 'skin-bounce-shadow',
    }),
    skinBounceLight: new MeshBasicMaterial({
        color: 0xffffff,
        fog: false,
        side: DoubleSide,
        name: 'skin-bounce-light',
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
    receiveShadow?: boolean;
}

// TODO: detect if some walls are occluding the player
export function createWall({
    size,
    position,
    rotation,
    receiveShadow,
}: WallOptions) {
    const sizeForGrid = size.multiplyScalar(gridSize);
    const geometry = new BoxGeometry(sizeForGrid.x, sizeForGrid.y, wallDepth);

    geometry.center();
    const wall = new Mesh(geometry, materials.phong);
    wall.name = 'wall';
    wall.translateX(sizeForGrid.x / 2);
    wall.translateY(sizeForGrid.y / 2);
    wall.translateZ(wallDepth / 2);
    wall.castShadow = true;
    if (receiveShadow) {
        wall.receiveShadow = true;
    }
    const wallGroup = new Group();
    wallGroup.name = 'wall-group';
    wallGroup.add(wall);

    // occlusion management
    wall.layers.enable(Layer.BLOOM);
    wall.layers.enable(Layer.OCCLUSION_PLAYER);

    positionOnGrid(wallGroup, position, rotation);
    return wallGroup;
}

// TODO: Check to remove / merge it with WallDoorProperties
interface WallDoorOptions {
    size: Vector3;
    position: Vector3;
    doorPosition: Vector3;
    rotation: Euler;
    id: string;
}

export function createWallDoor({
    size,
    position,
    doorPosition,
    rotation,
    id,
}: WallDoorOptions) {
    const group = new Object3D();
    // wall left to the door
    const wallLeft = createWall({
        size: new Vector3(size.x, size.y, 0),
        position: new Vector3(0.5, 0, 0),
        rotation: new Euler(),
    });
    wallLeft.name = 'wallLeft';
    const wallRight = createWall({
        size: new Vector3(size.x, size.y, 0),
        position: new Vector3(-0.5 - size.x, 0, 0),
        rotation: new Euler(),
    });
    wallRight.name = 'wallRight';
    group.add(wallLeft, wallRight);

    const createDoor = () => {
        // wall with door recess
        const wallDoor = new Mesh(geometries.wallDoor as any, materials.phong);
        wallDoor.layers.enable(Layer.BLOOM);
        wallDoor.layers.enable(Layer.OCCLUSION_PLAYER);
        wallDoor.name = 'wallDoor';
        wallDoor.castShadow = true;
        wallDoor.translateY(doorPosition.y * gridSize);
        wallDoor.translateZ(wallDepth / 2);
        const doorLeft = new Mesh(geometries.doorLeft as any, materials.phong);
        doorLeft.layers.enable(Layer.BLOOM);
        doorLeft.layers.enable(Layer.OCCLUSION_PLAYER);
        doorLeft.castShadow = true;
        doorLeft.translateY(doorPosition.y * gridSize);
        doorLeft.translateZ(wallDepth / 2);
        doorLeft.name = 'doorLeft';
        const doorRight = new Mesh(
            geometries.doorRight as any,
            materials.phong,
        );
        doorRight.layers.enable(Layer.BLOOM);
        doorRight.layers.enable(Layer.OCCLUSION_PLAYER);
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
            rotation: new Euler(),
        });
        wall.name = 'wallBelow';
        group.add(wall);
    }
    // top
    const sizeBetweenDoorAndTop = size.y - doorPosition.y;
    if (sizeBetweenDoorAndTop > 0) {
        const wall = createWall({
            size: new Vector3(1, sizeBetweenDoorAndTop - 1, 0),
            position: new Vector3(-0.5, doorPosition.y + 1, 0),
            rotation: new Euler(),
        });
        wall.name = 'wallTop';
        group.add(wall);
    }
    positionOnGrid(group, position, rotation);
    group.name = ElementName.WALL_DOOR(String(id));
    return group;
}

// TODO: Check to remove / merge it with ArchGroupProperties
interface ArchGroupOptions {
    size: Vector3;
    position: Vector3;
    rotation: Euler;
    withoutColumns?: true;
}

export function createArchGroup({
    size,
    position,
    rotation,
    withoutColumns,
}: ArchGroupOptions) {
    const group = new Object3D();

    if (!withoutColumns) {
        const columnGroup = new Object3D();
        group.add(columnGroup);

        const columnBackRight = createColumnGroup(size.y, 'normal');
        const columnBackLeft = createColumnGroup(size.y, 'normal');
        const columnFrontRight = createColumnGroup(size.y, 'normal');
        const columnFrontLeft = createColumnGroup(size.y, 'normal');
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
    platformMesh.layers.enable(Layer.BLOOM);
    platformMesh.layers.enable(Layer.OCCLUSION_PLAYER);
    platformMesh.castShadow = true;
    // platformMesh.receiveShadow = true;
    platformMesh.name = 'platform';
    // position the height of the platform only
    positionOnGrid(platformMesh, new Vector3(0, size.y, 0));
    group.add(platformMesh);

    positionOnGrid(group, position, rotation);

    return group;
}

export function createColumnGroup(
    size: number,
    geometryType: 'normal' | 'big',
) {
    const pedestalGeometry = geometries[
        `column_${geometryType}_pedestal`
    ] as BoxGeometry;
    // pedestalGeometry
    const partGeometry = geometries[`column_${geometryType}`] as BoxGeometry;
    const group = new Object3D();

    const columnStart = new Mesh(pedestalGeometry, materials.phong);
    columnStart.name = 'columnStart';
    columnStart.castShadow = true;
    columnStart.receiveShadow = true;
    columnStart.layers.enable(Layer.BLOOM);
    columnStart.layers.enable(Layer.OCCLUSION_PLAYER);
    group.add(columnStart);

    if (partGeometry) {
        const part = new Mesh(partGeometry, materials.phong);
        part.layers.enable(Layer.BLOOM);
        part.layers.enable(Layer.OCCLUSION_PLAYER);
        part.name = 'columnPart';
        part.castShadow = true;
        part.receiveShadow = true;
        part.scale.set(1, size - 0.02, 1);
        group.add(part);
    }

    const columnEnd = new Mesh(
        pedestalGeometry
            .clone()
            .rotateX(degreesToRadians(180))
            .translate(0, size * gridSize, 0),
        materials.phong,
    );
    columnEnd.layers.enable(Layer.BLOOM);
    columnEnd.layers.enable(Layer.OCCLUSION_PLAYER);
    columnEnd.name = 'columnEnd';
    columnEnd.updateMatrixWorld(true);
    columnEnd.matrix.decompose(
        columnEnd.position,
        columnEnd.quaternion,
        columnEnd.scale,
    );
    group.add(columnEnd);

    return group;
}

export interface BounceOptions {
    // size: Vector3;
    position: Vector3;
    rotation: Euler;
    side: Side;
    id: string;
    interactive: boolean;
}

export function createBounce({
    // size,
    position,
    rotation,
    side,
    id,
    interactive,
}: BounceOptions) {
    const sizeForGrid = new Vector3(1, 1, 1).multiplyScalar(gridSize / 1.5);
    const positionForGrid = position.multiplyScalar(gridSize);

    const group = new Object3D();
    group.name = ElementName.BOUNCE(id);
    group.position.set(positionForGrid.x, positionForGrid.y, positionForGrid.z);
    group.rotation.set(
        degreesToRadians(rotation.x),
        degreesToRadians(rotation.y),
        degreesToRadians(rotation.z),
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
    wall.layers.enable(Layer.BLOOM);
    if (side === Side.SHADOW) {
        wall.layers.enable(Layer.OCCLUSION_PLAYER);
    }
    group.add(wall);

    wall.geometry.center();
    wall.updateMatrix();
    wall.geometry.computeBoundingBox();
    wall.geometry.boundingBox?.getCenter(wall.center);
    wall.name = 'bounce-wall';

    return group;
}

export function createMountain() {
    const mountain = new Mesh(geometries.mountain, materials.phong);
    mountain.name = 'mountain';
    positionOnGrid(mountain, new Vector3(0, 0, -25));
    return mountain;
}

export interface AbstractLevel {
    collidingElements: Object3D[];
    startPosition: {
        light: Vector3;
        shadow: Vector3;
    };
    state: LevelState;
    doors: {
        wall: Object3D<Object3DEventMap>;
        openerPosition: Vector3;
    }[];
    bounces: Object3D[];
    doorOpeners: Object3D[];
    lightBounces: ElementToBounce[];
    updateMatrixWorld(force?: boolean): void;
}

function createDoorOpener(props: DoorOpenerProperties) {
    const group = new Object3D();
    group.name = `door-opener-group-${props.door_id}-${props.id}`;
    const areaDoorOpener = new InteractiveArea(
        ElementName.AREA_DOOR_OPENER(String(props.door_id), String(props.id)),
    );
    group.add(areaDoorOpener);
    group.position.copy(
        props.transform.position.clone().multiplyScalar(gridSize),
    );
    const rotationX = degreesToRadians(props.transform.rotation.x);
    const rotationY = degreesToRadians(props.transform.rotation.y);
    const rotationZ = degreesToRadians(props.transform.rotation.z);
    group.rotation.set(rotationX, rotationY, rotationZ);
    return group;
}

export function parseProperties(props: any) {
    const properties: Record<string, any> = {};
    Object.entries(props).forEach(([key, value]: [key: string, value: any]) => {
        switch (key) {
            case 'transform':
                properties[key] = {
                    rotation: new Euler(
                        value.rotation._x,
                        value.rotation._y,
                        value.rotation._z,
                    ),
                    position: new Vector3(
                        value.position.x,
                        value.position.y,
                        value.position.z,
                    ),
                };
                break;
            case 'size':
            case 'doorPosition':
                (properties as any)[key] = new Vector3(
                    value.x,
                    value.y,
                    value.z,
                );
                break;
            default:
                (properties as any)[key] = value;
                break;
        }
    });
    return properties;
}

export interface ClientGraphicHelpers {
    createEndLevelGraphic: () => Object3D;
    createBounceGraphic: (
        bounce: ElementToBounce,
        props: BounceProperties,
    ) => { skinBounce: Object3D; graphicSkin: Object3D | undefined };
    createDoorOpenerGraphic: (door_id: string | undefined) => Object3D;
    connectDoors: (elements: LevelElement[]) => void;
    mouseSelectableObjects: Object3D[];
    updatableElements: Object3D[];
}

export interface WorldContext {
    levelState: LevelState;
    bounceList: Object3D[];
    doorOpenersList: Object3D[];
    clientGraphicHelpers?: ClientGraphicHelpers;
}

export function updateLevelState(
    {
        levelState,
        bounceList,
        doorOpenersList,
        clientGraphicHelpers,
    }: WorldContext,
    type: ElementType,
    properties: ElementProperties,
    mesh: Object3D,
) {
    let props;
    switch (type) {
        case ElementType.DOOR_OPENER:
            props = properties as DoorOpenerProperties;
            if (
                props.door_id !== undefined &&
                levelState.doors[props.door_id] === undefined
            ) {
                levelState.doors[props.door_id] = {
                    [props.id]: [],
                };
            } else if (
                props.door_id !== undefined &&
                levelState.doors[props.door_id]
            ) {
                levelState.doors[props.door_id][props.id] = [];
            }

            if (clientGraphicHelpers) {
                const doorOpenerGraphic = mesh.children[1];
                clientGraphicHelpers.updatableElements.push(doorOpenerGraphic);
            }

            doorOpenersList.push(mesh);
            clientGraphicHelpers?.mouseSelectableObjects.push(mesh);
            break;
        case ElementType.WALL_DOOR:
            props = properties as WallDoorProperties;
            if (levelState.doors[props.id] === undefined) {
                levelState.doors[props.id] = {};
            }
            clientGraphicHelpers?.mouseSelectableObjects.push(mesh);
            break;
        case ElementType.BOUNCE:
            props = properties as BounceProperties;

            // if (props.interactive) {
            // TODO: Find a way to put in the state only the bounce that are interactive without issue with the server
            levelState.bounces[props.id] = {
                rotationY: props.transform.rotation.y,
            };
            // }

            if (props.side === Side.LIGHT && props.interactive) {
                clientGraphicHelpers?.updatableElements.push(mesh.children[2]);
            } else if (props.side === Side.SHADOW && props.interactive) {
                clientGraphicHelpers?.updatableElements.push(mesh.children[1]);
            }

            bounceList.push(mesh);

            clientGraphicHelpers?.mouseSelectableObjects.push(mesh.children[0]);
            break;
        case ElementType.END_LEVEL:
            if (clientGraphicHelpers) {
                clientGraphicHelpers.updatableElements.push(mesh.children[1]);
            }
            break;
        default:
            clientGraphicHelpers?.mouseSelectableObjects.push(mesh);
            break;
    }
}

export function createElement(
    { clientGraphicHelpers }: WorldContext,
    type: ElementType,
    properties?: ElementProperties,
): {
    mesh: Object3D;
    properties: ElementProperties;
} {
    let props;
    switch (type) {
        case ElementType.DOOR_OPENER:
            props =
                (properties as DoorOpenerProperties) ||
                new DoorOpenerProperties();
            const group = createDoorOpener(props);
            if (clientGraphicHelpers) {
                const doorOpener = clientGraphicHelpers.createDoorOpenerGraphic(
                    props.door_id,
                );
                group.add(doorOpener);
            }
            return {
                mesh: group,
                properties: props,
            };
        case ElementType.WALL_DOOR:
            props =
                (properties as WallDoorProperties) || new WallDoorProperties();
            const wallDoorGroup = createWallDoor({
                size: props.size.clone(),
                position: props.transform.position.clone(),
                doorPosition: props.doorPosition.clone(),
                rotation: props.transform.rotation.clone(),
                id: props.id,
            });
            return {
                mesh: wallDoorGroup,
                properties: props,
            };
        case ElementType.FAT_COLUMN:
            props =
                (properties as ColumnFatProperties) ||
                new ColumnFatProperties();
            const column = createColumnGroup(props.size.y, 'big');
            positionOnGrid(
                column,
                props.transform.position.clone(),
                props.transform.rotation.clone(),
            );
            return {
                mesh: column,
                properties: props,
            };
        case ElementType.END_LEVEL:
            props =
                (properties as EndLevelProperties) || new EndLevelProperties();
            const endLevelGroup = new Object3D();
            endLevelGroup.add(new InteractiveArea(ElementName.AREA_END_LEVEL));
            // graphic
            if (clientGraphicHelpers) {
                const endLevelGraphic =
                    clientGraphicHelpers.createEndLevelGraphic();
                endLevelGroup.add(endLevelGraphic);
            }
            positionOnGrid(endLevelGroup, props.transform.position.clone());
            return {
                mesh: endLevelGroup,
                properties: props,
            };
        case ElementType.ARCH:
            props = (properties as ArchProperties) || new ArchProperties();
            const archGroup = createArchGroup({
                size: props.size.clone(),
                position: props.transform.position.clone(),
                rotation: props.transform.rotation.clone(),
            });
            return {
                mesh: archGroup,
                properties: props,
            };
        case ElementType.BOUNCE:
            props = (properties as BounceProperties) || new BounceProperties();
            const bounceGroup = createBounce({
                // size: props.size.clone(),
                position: props.transform.position.clone(),
                rotation: props.transform.rotation.clone(),
                id: props.id,
                side: props.side,
                interactive: props.interactive,
            });
            if (clientGraphicHelpers) {
                const { skinBounce, graphicSkin } =
                    clientGraphicHelpers.createBounceGraphic(
                        bounceGroup.children[0] as ElementToBounce,
                        props,
                    );
                if (props.interactive) {
                    bounceGroup.add(skinBounce);
                }

                if (graphicSkin) {
                    bounceGroup.add(graphicSkin);
                }
            }
            return {
                mesh: bounceGroup,
                properties: props,
            };
        case ElementType.WALL:
        default:
            props = (properties as WallProperties) || new WallProperties();
            const wallGroup = createWall({
                size: props.size.clone(),
                position: props.transform.position.clone(),
                rotation: props.transform.rotation.clone(),
            });
            return {
                mesh: wallGroup,
                properties: props,
            };
    }
}

export function parseLevelElements(
    worldContext: WorldContext,
    elementList: any[],
): LevelElement[] {
    // create each elements
    const elements = elementList.map((el: any) => {
        const properties = parseProperties(el.properties);

        if (
            el.type === ElementType.DOOR_OPENER &&
            (properties as DoorOpenerProperties).door_id === undefined
        ) {
            (properties as DoorOpenerProperties).door_id = undefined;
        }
        const { mesh } = createElement(
            worldContext,
            el.type,
            properties as any,
        );
        updateLevelState(worldContext, el.type, properties as any, mesh);

        return {
            type: el.type as ElementType,
            name: el.name,
            mesh,
            properties: properties,
            isLocked: el.isLocked,
        };
    });

    if (worldContext.clientGraphicHelpers) {
        worldContext.clientGraphicHelpers.connectDoors(
            elements as LevelElement[],
        );
    }
    return elements as LevelElement[];
}

export function createCollisionAreaMesh() {
    const geometry = new PlaneGeometry(100000, 100000);
    const material = new MeshBasicMaterial({
        color: 0xff0000, // red color
        transparent: true,
        opacity: 0.1,
    });
    const mesh = new Mesh(geometry, material);
    mesh.name = 'collision-area';
    mesh.position.y = 100000 / 2;
    return mesh;
}

const collisionAreaMesh = createCollisionAreaMesh();
function detectIfMeshIsCollidable(mesh: Mesh): boolean {
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);

    const transformedVertices = [];
    for (let i = 0; i < geometry.attributes.position.count; i++) {
        const vertex = new Vector3(
            geometry.attributes.position.getX(i),
            geometry.attributes.position.getY(i),
            geometry.attributes.position.getZ(i),
        );
        transformedVertices.push(vertex);
    }

    const meshBBox = new Box3().setFromPoints(transformedVertices);
    const collisionBBox = new Box3().setFromObject(collisionAreaMesh);
    return meshBBox.intersectsBox(collisionBBox);
}

export function addToCollidingElements(
    group: Object3D,
    collidingElements: Object3D[],
) {
    const pushToCollidingElements = (mesh: Mesh) => {
        if (detectIfMeshIsCollidable(mesh)) {
            if (mesh.geometry && (mesh.geometry as any).computeBoundsTree) {
                (mesh.geometry as any)?.computeBoundsTree();
                const obstacleBox = new Box3();
                obstacleBox.setFromObject(mesh, true);
                (mesh as any).boundingBox = obstacleBox;
                collidingElements.push(mesh);
            } else {
                console.log('HERE not bounds tree', mesh);
            }
        }
    };
    const checkChildren = (elements: Object3D[]) => {
        for (let i = 0; i < elements.length; i++) {
            const child = elements[i];
            const notCollidable = ['particles', 'pulse'];
            if (
                child.name.includes('Occlusion') ||
                child.name.includes('skin-bounce') ||
                notCollidable.includes(child.name)
            ) {
                continue;
            }
            if (child.children.length > 0) {
                checkChildren(child.children);
            } else {
                pushToCollidingElements(child as Mesh);
            }
        }
    };
    group.updateMatrixWorld(true);
    checkChildren(group.children);
}
