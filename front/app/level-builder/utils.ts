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
} from './types';
import { SkinBounce } from '../Game/elements/SkinBounce';
import { Pulse } from '../Game/elements/Pulse';
import { SkinBounceShadow } from '../Game/elements/SkinBounceShadow';
import App from '../Game/App';
import { EndLevel } from '../Game/elements/EndLevel';

export function createElement(
    app: App,
    type: ElementType,
    properties?: ElementProperties,
): [Object3D, ElementProperties] {
    let props;
    switch (type) {
        case ElementType.FAT_COLUMN:
            props =
                (properties as ColumnFatProperties) ||
                new ColumnFatProperties();
            const column = createColumnGroup(props.size.y, 'big');
            positionOnGrid(column, props.position.clone());
            return [column, props];
        case ElementType.END_LEVEL:
            props =
                (properties as EndLevelProperties) || new EndLevelProperties();
            const endLevelGroup = new InteractiveArea(
                ElementName.AREA_END_LEVEL,
            );
            const endLevelGraphic = new EndLevel();
            endLevelGroup.add(endLevelGraphic);
            positionOnGrid(endLevelGroup, props.position);
            return [endLevelGroup, props];
        case ElementType.ARCH:
            props = (properties as ArchProperties) || new ArchProperties();
            return [
                createArchGroup({
                    size: props.size.clone(),
                    position: props.position.clone(),
                }),
                props,
            ];
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
            return [bounceGroup, props];
        case ElementType.WALL:
        default:
            props = (properties as WallProperties) || new WallProperties();
            return [
                createWall({
                    size: props.size.clone(),
                    position: props.position.clone(),
                    rotation: props.rotation.clone(),
                }),
                props,
            ];
    }
}
