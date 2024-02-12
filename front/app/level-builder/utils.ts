import type { Object3D } from 'three';
import {
    createArchGroup,
    createBounce,
    createWall,
} from '@benjaminbours/composite-core';
import {
    BounceProperties,
    ElementProperties,
    ElementType,
    WallProperties,
    ArchProperties,
} from './types';

export function createElement(
    type: ElementType,
    properties?: ElementProperties,
): [Object3D, ElementProperties] {
    let props;
    switch (type) {
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
            props = (properties as BounceProperties) || new BounceProperties();
            console.log(props);
            return [
                createBounce({
                    size: props.size.clone(),
                    position: props.position.clone(),
                    rotation: props.rotation.clone(),
                    id: 0,
                    side: props.side,
                    interactive: props.interactive,
                }),
                props,
            ];
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
