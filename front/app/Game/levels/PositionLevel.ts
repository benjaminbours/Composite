import { Group, Vector3 } from 'three';
import {
    createArchGroup,
    createWall,
    createWallDoor,
    positionInsideGridBox,
    positionOnGrid,
} from './levels.utils';
import { CollidingElem } from '../types';
import { MysticPlace } from '../elements/MysticPlace';

export class PositionLevel extends Group {
    public collidingElements: CollidingElem[] = [];
    public name = 'position-level';

    public startPosition = {
        light: new Vector3(10, 20, 0),
        // light: new Vector3(1626, 775, 0),
        shadow: new Vector3(15, 20, 0),
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

        const arches = [
            createArchGroup(1, new Vector3(2, 0, 0)),
            createArchGroup(2, new Vector3(4, 0, 0)),
            createArchGroup(3, new Vector3(6, 0, 0)),
        ];

        arches.forEach((arch) => {
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
            new Vector3(9, 0, -1),
            new Vector3(0, 0, 0),
        );
        this.add(wallInsideTemple);

        // wall door
        const wallDoorGroundFloor = createWallDoor(
            new Vector3(3, 3, 0),
            new Vector3(9, 0, 0),
            new Vector3(0, 0, 0),
            'vertical',
        );
        this.add(wallDoorGroundFloor);
        this.collidingElements.push(wallDoorGroundFloor);

        const wallDoorRoof = createWallDoor(
            new Vector3(2, 6, 0),
            new Vector3(8, 3, 0),
            new Vector3(0, 3, 0),
            'horizontal',
        );
        this.add(wallDoorRoof);
        this.collidingElements.push(wallDoorRoof);

        const mysticPlace = new MysticPlace(300);
        this.add(mysticPlace);
        this.collidingElements.push(mysticPlace);
        positionOnGrid(mysticPlace, new Vector3(1, 0, 0));
    }
}
