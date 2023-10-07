// vendors
import { Color, Vector3 } from 'three';
// our libs
import { ElementName, PositionLevel } from '@benjaminbours/composite-core';
// local
import { DoorOpener } from '../elements/DoorOpener';
import { EndLevel } from '../elements/EndLevel';

export class PositionLevelWithGraphic extends PositionLevel {
    constructor() {
        super();

        const doors = [
            {
                id: 'ground',
                color: new Color('black'),
                cameraPosition: new Vector3(50, 200),
            },
            {
                id: 'roof',
                color: new Color('white'),
                cameraPosition: new Vector3(0, 100),
            },
        ];

        doors.forEach(({ id, color, cameraPosition }) => {
            const wallDoor = this.children.find(
                (child) => child.name === ElementName.WALL_DOOR(id),
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
                ElementName.DOOR_OPENER(id),
                {
                    cameraPosition:
                        groundFloorDoorWorldPosition.add(cameraPosition),
                    doorLeft: groundFloorDoorLeft!,
                    doorRight: groundFloorDoorRight!,
                },
                color,
            );
            const area = this.children.find(
                (child) => child.name === ElementName.AREA_DOOR_OPENER(id),
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
