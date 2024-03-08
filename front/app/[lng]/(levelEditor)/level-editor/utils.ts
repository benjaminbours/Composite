import { Euler, Mesh, Object3D, ObjectLoader, Vector3 } from 'three';
import {
    ElementName,
    ElementToBounce,
    InteractiveArea,
    Side,
    createArchGroup,
    createBounce,
    createColumnGroup,
    createWall,
    createWallDoor,
    positionOnGrid,
} from '@benjaminbours/composite-core';
import {
    BounceProperties,
    ElementProperties,
    ElementType,
    WallProperties,
    ArchProperties,
    EndLevelProperties,
    ColumnFatProperties,
    WallDoorProperties,
    DoorOpenerProperties,
    LevelElement,
} from './types';
import { SkinBounce } from '../../../Game/elements/SkinBounce';
import { Pulse } from '../../../Game/elements/Pulse';
import { SkinBounceShadow } from '../../../Game/elements/SkinBounceShadow';
import App from '../../../Game/App';
import { EndLevel } from '../../../Game/elements/EndLevel';
import { DoorInfo, DoorOpener } from '../../../Game/elements/DoorOpener';

export function computeDoorInfo(
    wallDoor: Object3D,
    area: DoorOpener,
): DoorInfo {
    const doorLeft = wallDoor.children.find(
        (child) => child.name === 'doorLeft',
    );
    const doorRight = wallDoor.children.find(
        (child) => child.name === 'doorRight',
    );
    const doorWorldPosition = doorLeft!.getWorldPosition(new Vector3());
    const sign =
        doorWorldPosition.x - area.getWorldPosition(new Vector3()).x > 0
            ? -1
            : 1;

    const cameraPosition = new Vector3(100 * sign, 200);
    return {
        cameraPosition: doorWorldPosition.add(cameraPosition),
        doorLeft: doorLeft!,
        doorRight: doorRight!,
    };
}

export function createElement(
    app: App,
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
            const group = new Object3D();
            group.name = `door-opener-group-${props.door_id}`;
            group.add(
                new InteractiveArea(
                    ElementName.AREA_DOOR_OPENER(String(props.door_id)),
                ),
            );
            group.add(
                new DoorOpener(ElementName.DOOR_OPENER(String(props.door_id))),
            );
            return {
                mesh: group,
                properties: props,
            };
        case ElementType.WALL_DOOR:
            props =
                (properties as WallDoorProperties) ||
                new WallDoorProperties(
                    Object.keys(
                        app.gameStateManager.currentState.level.doors,
                    ).length,
                );
            const wallDoorGroup = createWallDoor({
                size: props.size.clone(),
                position: props.position.clone(),
                doorPosition: props.doorPosition.clone(),
                rotation: props.rotation.clone(),
            });
            wallDoorGroup.name = ElementName.WALL_DOOR(String(props.id));
            app.gameStateManager.currentState.level.doors[props.id] = [];
            return {
                mesh: wallDoorGroup,
                properties: props,
            };
        case ElementType.FAT_COLUMN:
            props =
                (properties as ColumnFatProperties) ||
                new ColumnFatProperties();
            const column = createColumnGroup(props.size.y, 'big');
            positionOnGrid(column, props.position.clone());
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
            endLevelGroup.add(new EndLevel());
            positionOnGrid(endLevelGroup, props.position);
            return {
                mesh: endLevelGroup,
                properties: props,
            };
        case ElementType.ARCH:
            props = (properties as ArchProperties) || new ArchProperties();
            return {
                mesh: createArchGroup({
                    size: props.size.clone(),
                    position: props.position.clone(),
                }),
                properties: props,
            };
        case ElementType.BOUNCE:
            props =
                (properties as BounceProperties) ||
                new BounceProperties(
                    Object.keys(
                        app.gameStateManager.currentState.level.bounces,
                    ).length,
                );
            const bounceGroup = createBounce({
                // size: props.size.clone(),
                position: props.position.clone(),
                rotation: props.rotation.clone(),
                id: props.id,
                side: props.side,
                interactive: props.interactive,
            });
            bounceGroup.add(
                new SkinBounce(bounceGroup.children[0] as ElementToBounce),
            );

            if (props.side === Side.LIGHT) {
                app.rendererManager.addLightBounceComposer(
                    bounceGroup.children[0] as ElementToBounce,
                );
                // initialization of the skin is done with postprocessing, it is spread around the App class, at the root of the game rendering
                if (props.interactive) {
                    bounceGroup.add(
                        new Pulse(bounceGroup.children[0] as ElementToBounce),
                    );
                }
            }

            if (props.side === Side.SHADOW) {
                bounceGroup.add(
                    new SkinBounceShadow(
                        bounceGroup.children[0] as ElementToBounce,
                    ),
                );
            }
            app.gameStateManager.currentState.level.bounces[props.id] = {
                rotationY: (bounceGroup.children[0] as ElementToBounce).rotation
                    .y,
            };
            app.level.bounces.push(bounceGroup);

            return {
                mesh: bounceGroup,
                properties: props,
            };
        case ElementType.WALL:
        default:
            props = (properties as WallProperties) || new WallProperties();
            return {
                mesh: createWall({
                    size: props.size.clone(),
                    position: props.position.clone(),
                    rotation: props.rotation.clone(),
                }),
                properties: props,
            };
    }
}

export function removeMeshFromScene(
    app: App,
    elements: LevelElement[],
    index: number,
) {
    const mesh = elements[index].mesh;
    app.scene.remove(mesh);
    if (mesh.id === app.controlledMesh?.id) {
        app.detachTransformControls();
    }
    app.removeFromCollidingElements(mesh);
    if (mesh.name.includes('WALL_DOOR')) {
        const id = mesh.name.split('_')[0];
        delete app.gameStateManager.currentState.level.doors[id];
    }
    if (mesh.name.includes('BOUNCE')) {
        const bounce = mesh.children[0] as ElementToBounce;
        const index = app.level.bounces.findIndex((el) => el === mesh);
        app.level.bounces.splice(index, 1);
        delete app.gameStateManager.currentState.level.bounces[bounce.bounceID];
        if (bounce.side === Side.LIGHT) {
            app.rendererManager.removeLightBounceComposer(bounce);
        }
    }
}

export function addMeshToScene(app: App, type: ElementType, group: Object3D) {
    app.scene.add(group);
    app.attachTransformControls(group);
    addToCollidingElements(app, group);
}

export function addToCollidingElements(app: App, group: Object3D) {
    const addToCollidingElements = (mesh: Mesh) => {
        if (app.detectIfMeshIsCollidable(mesh)) {
            (mesh.geometry as any).computeBoundsTree();
            app.collidingElements.push(mesh);
        }
    };
    const checkChildren = (elements: Object3D[]) => {
        for (let i = 0; i < elements.length; i++) {
            const child = elements[i];
            const notCollidable = ['particles'];
            if (
                child.name.includes('Occlusion') ||
                notCollidable.includes(child.name) ||
                child instanceof SkinBounce === true
            ) {
                continue;
            }
            if (child.children.length > 0) {
                checkChildren(child.children);
            } else {
                addToCollidingElements(child as Mesh);
            }
        }
    };
    checkChildren(group.children);
}

export function parseLevelElements(elementList: any[]): LevelElement[] {
    const loader = new ObjectLoader();
    const elements = elementList.map((el: any) => {
        const properties: Record<string, any> = {};
        Object.entries(el.properties).forEach(
            ([key, value]: [key: string, value: any]) => {
                switch (key) {
                    case 'rotation':
                        properties[key] = new Euler(
                            value._x,
                            value._y,
                            value._z,
                        );
                        break;
                    case 'position':
                    case 'size':
                    case 'doorPosition':
                        properties[key] = new Vector3(
                            value.x,
                            value.y,
                            value.z,
                        );
                        break;
                    default:
                        properties[key] = value;
                        break;
                }
            },
        );

        return {
            type: el.type as ElementType,
            name: el.name,
            mesh: loader.parse(el.mesh),
            properties: properties,
        };
    });

    return elements as LevelElement[];
}
