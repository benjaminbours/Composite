import { Object3D, Vector3 } from 'three';
import {
    ElementName,
    ElementToBounce,
    Side,
    BounceProperties,
    ElementType,
    WallDoorProperties,
    DoorOpenerProperties,
    LevelElement,
} from '@benjaminbours/composite-core';
import { DoorInfo, DoorOpenerGraphic } from './DoorOpenerGraphic';
import { EndLevel } from './EndLevel';
import { SkinBounce } from './SkinBounce';
import { SkinBounceShadow } from './SkinBounceShadow';
import { Pulse } from './Pulse';

export function computeDoorInfo(
    wallDoor: Object3D,
    area: DoorOpenerGraphic,
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

// connect door openers and doors (graphic)
export function connectDoors(elements: LevelElement[]) {
    elements
        .filter((el) => el.type === ElementType.DOOR_OPENER)
        .forEach((el) => {
            const doorOpener = el.mesh.children[1] as DoorOpenerGraphic;
            const doorId = (el.properties as DoorOpenerProperties).door_id;
            const door = elements.find(
                (el) =>
                    el.type === ElementType.WALL_DOOR &&
                    (el.properties as WallDoorProperties).id === doorId,
            );
            if (door) {
                const doorInfo = computeDoorInfo(door.mesh, doorOpener);
                doorOpener.doorInfo = doorInfo;
            } else {
                doorOpener.doorInfo = undefined;
            }
        });
}

export function addDoorOpenerGraphic(
    group: Object3D,
    door_id: number | undefined,
) {
    const doorOpener = new DoorOpenerGraphic(
        ElementName.DOOR_OPENER(String(door_id)),
    );
    group.add(doorOpener);
}

export function addEndLevelGraphic(group: Object3D) {
    group.add(new EndLevel());
}

export function addBounceGraphic(
    group: Object3D,
    props: BounceProperties,
    addLightBounceComposer: (bounce: ElementToBounce) => void,
) {
    group.add(new SkinBounce(group.children[0] as ElementToBounce));

    if (props.side === Side.LIGHT) {
        addLightBounceComposer(group.children[0] as ElementToBounce);
        // initialization of the skin is done with postprocessing, it is spread around the App class, at the root of the game rendering
        if (props.interactive) {
            group.add(new Pulse(group.children[0] as ElementToBounce));
        }
    }

    if (props.side === Side.SHADOW) {
        group.add(new SkinBounceShadow(group.children[0] as ElementToBounce));
    }
}
