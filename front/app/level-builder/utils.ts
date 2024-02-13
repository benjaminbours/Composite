import { Object3D } from 'three';
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
} from './types';
import { SkinBounce } from '../Game/elements/SkinBounce';
import { Pulse } from '../Game/elements/Pulse';
import { SkinBounceShadow } from '../Game/elements/SkinBounceShadow';
import App from '../Game/App';
import { EndLevel } from '../Game/elements/EndLevel';
import { DoorOpener } from '../Game/elements/DoorOpener';

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
            const doorOpenerGroup = new InteractiveArea(
                ElementName.AREA_DOOR_OPENER(String(props.door_id)),
            );
            const doorOpener = new DoorOpener(
                ElementName.DOOR_OPENER(String(props.door_id)),
            );
            doorOpenerGroup.add(doorOpener);
            return {
                mesh: doorOpenerGroup,
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
            const endLevelGroup = new InteractiveArea(
                ElementName.AREA_END_LEVEL,
            );
            const endLevelGraphic = new EndLevel();
            endLevelGroup.add(endLevelGraphic);
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
