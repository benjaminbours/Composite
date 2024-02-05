// vendors
import { Vector3 } from 'three';
// our libs
import { ElementName, CrackTheDoorLevel } from '@benjaminbours/composite-core';
// local
import { DoorOpener } from '../elements/DoorOpener';
import { EndLevel } from '../elements/EndLevel';

export class CrackTheDoorLevelWithGraphic extends CrackTheDoorLevel {
    constructor() {
        super();

        const doors = [
            {
                cameraPosition: new Vector3(50, 200),
            },
            {
                cameraPosition: new Vector3(0, 100),
            },
        ];

        doors.forEach(({ cameraPosition }, index) => {
            const wallDoor = this.children.find(
                (child) => child.name === ElementName.WALL_DOOR(String(index)),
            )!;
            const groundFloorDoorLeft = wallDoor.children.find(
                (child) => child.name === 'doorLeft',
            );
            const groundFloorDoorRight = wallDoor.children.find(
                (child) => child.name === 'doorRight',
            );
            const groundFloorDoorWorldPosition =
                groundFloorDoorLeft!.getWorldPosition(new Vector3());
            const groundFloorDoorOpener = new DoorOpener(
                ElementName.DOOR_OPENER(String(index)),
                {
                    cameraPosition:
                        groundFloorDoorWorldPosition.add(cameraPosition),
                    doorLeft: groundFloorDoorLeft!,
                    doorRight: groundFloorDoorRight!,
                },
            );
            const area = this.children.find(
                (child) => child.name === ElementName.AREA_DOOR_OPENER(String(index)),
            )!;
            area.add(groundFloorDoorOpener);
        });
        const endLevel = new EndLevel();
        const endArea = this.children.find(
            (child) => child.name === ElementName.AREA_END_LEVEL,
        )!;
        endArea.add(endLevel);
    }
}
