import { Color, Group, Vector3 } from 'three';
import {
    createArchGroup,
    createWall,
    createWallDoor,
    positionInsideGridBox,
    positionOnGrid,
} from './levels.utils';
import { CollidingElem } from '../types';
import { MysticPlace } from '../elements/MysticPlace';
import { DoorOpener } from '../elements/DoorOpener';
import { EndLevel } from '../elements/EndLevel';
// import { Elevator } from '../elements/Elevator';

export class PositionLevel extends Group {
    public collidingElements: CollidingElem[] = [];
    public name = 'position-level';

    public startPosition = {
        // light: new Vector3(10, 20, 0), // start level
        // light: new Vector3(2200, 775, 0), // on the floor
        // shadow: new Vector3(200, 20, 0),
        light: new Vector3(2500, 20, 0), // end level
        shadow: new Vector3(2500, 20, 0), // end level
    };

    constructor() {
        super();

        const wallBlockingLeftPath = createWall(
            new Vector3(4, 2, 0),
            new Vector3(-2, 0, 2),
            new Vector3(0, 90, 0),
        );
        this.add(wallBlockingLeftPath);
        this.collidingElements.push(wallBlockingLeftPath);

        const outsideArches = [
            createArchGroup(1, new Vector3(2, 0, 0)),
            createArchGroup(2, new Vector3(4, 0, 0)),
            createArchGroup(3, new Vector3(6, 0, 0)),
        ];

        outsideArches.forEach((arch) => {
            this.add(arch);
            // TODO: Add only the platform to the list of colliding elements
            this.collidingElements.push(arch);
        });

        const templeEndWall = createWall(
            new Vector3(4, 5, 0),
            new Vector3(13, 0, 2),
            new Vector3(0, 90, 0),
        );
        this.add(templeEndWall);
        this.collidingElements.push(templeEndWall);

        const wallInsideTemple = createWall(
            new Vector3(6, 3, 0),
            new Vector3(9, 0, -2),
            new Vector3(0, 0, 0),
        );
        this.add(wallInsideTemple);

        // ground door
        const wallDoorGroundFloor = createWallDoor(
            new Vector3(0, 3, 0),
            new Vector3(9, 0, 0),
            new Vector3(0, 0, 0),
            'vertical',
        );
        this.add(wallDoorGroundFloor);
        this.collidingElements.push(wallDoorGroundFloor);

        const groundFloorDoorLeft = wallDoorGroundFloor.children.find(
            (child) => child.name === 'doorLeft',
        );
        const groundFloorDoorRight = wallDoorGroundFloor.children.find(
            (child) => child.name === 'doorRight',
        );
        const groundFloorDoorWorldPosition =
            groundFloorDoorLeft!.getWorldPosition(new Vector3());
        const groundFloorDoorOpener = new DoorOpener(
            {
                cameraPosition: new Vector3(
                    groundFloorDoorWorldPosition.x + 50,
                    groundFloorDoorWorldPosition.y + 200,
                ),
                doorLeft: groundFloorDoorLeft!,
                doorRight: groundFloorDoorRight!,
            },
            new Color('black'),
        );
        this.collidingElements.push(groundFloorDoorOpener);
        positionOnGrid(groundFloorDoorOpener, new Vector3(10, 1.02, 0));
        this.add(groundFloorDoorOpener);

        // roof door
        const wallDoorRoof = createWallDoor(
            new Vector3(2, 6, 0),
            new Vector3(8, 3, 0),
            new Vector3(0, 3, 0),
            'horizontal',
        );
        this.add(wallDoorRoof);
        this.collidingElements.push(wallDoorRoof);

        const roofDoorLeft = wallDoorRoof.children.find(
            (child) => child.name === 'doorLeft',
        );
        const roofDoorRight = wallDoorRoof.children.find(
            (child) => child.name === 'doorRight',
        );
        const roofDoorWorldPosition = roofDoorLeft!.getWorldPosition(
            new Vector3(),
        );
        const roofDoorOpener = new DoorOpener(
            {
                cameraPosition: new Vector3(
                    roofDoorWorldPosition.x,
                    roofDoorWorldPosition.y + 100,
                ),
                doorLeft: roofDoorLeft!,
                doorRight: roofDoorRight!,
            },
            new Color('white'),
        );
        this.collidingElements.push(roofDoorOpener);
        positionOnGrid(roofDoorOpener, new Vector3(10, 3, 0));
        this.add(roofDoorOpener);

        const insideArches = [
            createArchGroup(1, new Vector3(10, 0, 0)),
            createArchGroup(2, new Vector3(12, 0, 0)),
        ];

        insideArches.forEach((arch) => {
            this.add(arch);
            // TODO: Add only the platform to the list of colliding elements
            this.collidingElements.push(arch);
        });

        const endLevel = new EndLevel(new Color('white'));
        this.add(endLevel);
        this.collidingElements.push(endLevel);
        positionOnGrid(endLevel, new Vector3(11, 0, 0));

        // const mystic2 = new Elevator(1000, 300, new Color('yellow'));
        // this.add(mystic2);
        // this.collidingElements.push(mystic2);
        // positionOnGrid(mystic2, new Vector3(8, 3, 0));
    }
}