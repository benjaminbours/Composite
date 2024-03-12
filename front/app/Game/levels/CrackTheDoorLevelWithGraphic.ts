// vendors
import { Vector3 } from 'three';
// our libs
import { ElementName, CrackTheDoorLevel } from '@benjaminbours/composite-core';
// local
import { DoorOpenerGraphic } from '../elements/DoorOpenerGraphic';
import { EndLevel } from '../elements/EndLevel';

export class CrackTheDoorLevelWithGraphic extends CrackTheDoorLevel {
    constructor() {
        super();

        this.doors.forEach((_, index) => {
            const wallDoor = this.children.find(
                (child) => child.name === ElementName.WALL_DOOR(String(index)),
            )!;
            const doorLeft = wallDoor.children.find(
                (child) => child.name === 'doorLeft',
            );
            const doorRight = wallDoor.children.find(
                (child) => child.name === 'doorRight',
            );
            const doorWorldPosition = doorLeft!.getWorldPosition(new Vector3());
            const area = this.children.find(
                (child) =>
                    child.name === ElementName.AREA_DOOR_OPENER(String(index)),
            )!;

            const sign =
                doorWorldPosition.x - area.getWorldPosition(new Vector3()).x > 0
                    ? -1
                    : 1;

            const cameraPosition = new Vector3(100 * sign, 200);
            const doorOpener = new DoorOpenerGraphic(
                ElementName.DOOR_OPENER(String(index)),
                // {
                //     cameraPosition: doorWorldPosition.add(cameraPosition),
                //     doorLeft: doorLeft!,
                //     doorRight: doorRight!,
                // },
            );
            area.add(doorOpener);
        });
        const endLevel = new EndLevel();
        const endArea = this.children.find(
            (child) => child.name === ElementName.AREA_END_LEVEL,
        )!;
        endArea.add(endLevel);
    }
}
