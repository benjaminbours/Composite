// vendors
import { Group, Vector3 } from 'three';
// local
import {
    createArchGroup,
    createWall,
    createWallDoor,
    positionOnGrid,
} from './levels.utils';
import { CollidingElem } from '../types';
import { InteractiveArea } from '../elements/InteractiveArea';

export class PositionLevel extends Group {
    public collidingElements: CollidingElem[] = [];
    public interactiveElements: any[] = [];
    public name = 'position-level';

    public startPosition = {
        light: new Vector3(10, 20, 0), // start level
        shadow: new Vector3(200, 20, 0),
    };

    protected groundFloorDoorOpener: InteractiveArea;
    protected roofDoorOpener: InteractiveArea;
    protected endLevel: InteractiveArea;

    constructor() {
        super();

        // TODO: The server collision system does not see the same as the client. Investigate why,
        // use name on mesh to understand better the data
        const wallBlockingLeftPath = createWall(
            new Vector3(4, 2, 0),
            new Vector3(-2, 0, 2),
            new Vector3(0, 90, 0),
            'wall left',
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
        wallDoorGroundFloor.name = 'wallDoorGroundFloor';
        this.add(wallDoorGroundFloor);
        this.collidingElements.push(wallDoorGroundFloor);

        this.groundFloorDoorOpener = new InteractiveArea(
            'groundDoor_doorOpener',
        );
        this.collidingElements.push(this.groundFloorDoorOpener);
        this.interactiveElements.push(this.groundFloorDoorOpener);
        positionOnGrid(this.groundFloorDoorOpener, new Vector3(10, 1.02, 0));
        this.add(this.groundFloorDoorOpener);

        // roof door
        const wallDoorRoof = createWallDoor(
            new Vector3(2, 6, 0),
            new Vector3(8, 3, 0),
            new Vector3(0, 3, 0),
            'horizontal',
        );
        wallDoorRoof.name = 'wallDoorRoof';
        this.add(wallDoorRoof);
        this.collidingElements.push(wallDoorRoof);

        this.roofDoorOpener = new InteractiveArea('roofDoor_doorOpener');
        this.collidingElements.push(this.roofDoorOpener);
        this.interactiveElements.push(this.roofDoorOpener);
        positionOnGrid(this.roofDoorOpener, new Vector3(10, 3, 0));
        this.add(this.roofDoorOpener);

        const insideArches = [
            createArchGroup(1, new Vector3(10, 0, 0)),
            createArchGroup(2, new Vector3(12, 0, 0)),
        ];

        insideArches.forEach((arch) => {
            this.add(arch);
            // TODO: Add only the platform to the list of colliding elements
            this.collidingElements.push(arch);
        });

        this.endLevel = new InteractiveArea('endLevel');
        this.add(this.endLevel);
        this.collidingElements.push(this.endLevel);
        this.interactiveElements.push(this.endLevel);
        positionOnGrid(this.endLevel, new Vector3(11, 0, 0));
    }
}
