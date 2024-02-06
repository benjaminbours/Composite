// vendors
import { Group, Object3D, Vector3, Mesh } from 'three';
// local
import {
    ElementName,
    AbstractLevel,
    createArchGroup,
    createWall,
    createWallDoor,
    positionOnGrid,
} from './levels.utils';
import { InteractiveArea } from '../elements/InteractiveArea';
import { Levels, LevelState } from '../GameState';
import { ElementToBounce } from '../elements';

export class CrackTheDoorLevel extends Group implements AbstractLevel {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'crack-the-door';
    public bounces: ElementToBounce[] = [];
    public lightBounces: ElementToBounce[] = [];

    public startPosition = {
        light: new Vector3(10, 20, 0), // start level
        shadow: new Vector3(200, 20, 0),
        // shadow: new Vector3(2200, 775, 0), // roof door
        // light: new Vector3(2500, 20, 0), // end level
        // shadow: new Vector3(2400, 20, 0), // end level
    };

    public state: LevelState = {
        id: Levels.CRACK_THE_DOOR,
        doors: {},
        bounces: {},
        end_level: [],
    };

    constructor() {
        super();
        const wallBlockingLeftPath = createWall({
            size: new Vector3(4, 2, 0),
            position: new Vector3(-2, 0, 2),
            rotation: new Vector3(0, 90, 0),
        });
        this.add(wallBlockingLeftPath);
        this.collidingElements.push(wallBlockingLeftPath);

        const outsideArches = [
            createArchGroup({
                height: 1,
                position: new Vector3(2, 0, 0),
            }),
            createArchGroup({
                height: 2,
                position: new Vector3(4, 0, 0),
            }),
            createArchGroup({
                height: 3,
                position: new Vector3(6, 0, 0),
            }),
        ];

        outsideArches.forEach((arch) => {
            this.add(arch);
            const platform = arch.children.find(
                (child) => child.name === 'platform',
            );
            if (platform) {
                this.collidingElements.push(platform);
            }
        });

        const templeEndWall = createWall({
            size: new Vector3(4, 5, 0),
            position: new Vector3(13, 0, 2),
            rotation: new Vector3(0, 90, 0),
        });
        this.add(templeEndWall);
        this.collidingElements.push(templeEndWall);

        const wallInsideTemple = createWall({
            size: new Vector3(6, 3, 0),
            position: new Vector3(9, 0, -2),
            rotation: new Vector3(0, 0, 0),
        });
        this.add(wallInsideTemple);

        const doorList = [
            {
                id: 'ground',
                wall: createWallDoor(
                    new Vector3(0, 3, 0),
                    new Vector3(9, 0, 0),
                    new Vector3(0, 0, 0),
                    'vertical',
                ),
                openerPosition: new Vector3(10, 1.02, 0),
            },
            {
                id: 'roof',
                wall: createWallDoor(
                    new Vector3(2, 6, 0),
                    new Vector3(8, 3, 0),
                    new Vector3(0, 3, 0),
                    'horizontal',
                ),
                openerPosition: new Vector3(10, 3, 0),
            },
        ];

        doorList.forEach(({ id, wall, openerPosition }) => {
            this.state.doors[id] = [];
            wall.name = ElementName.WALL_DOOR(id);
            this.add(wall);
            this.collidingElements.push(wall);

            const doorOpener = new InteractiveArea(
                ElementName.AREA_DOOR_OPENER(id),
            );
            this.collidingElements.push(doorOpener);
            this.interactiveElements.push(doorOpener);
            positionOnGrid(doorOpener, openerPosition);
            this.add(doorOpener);
        });

        const insideArches = [
            createArchGroup({
                height: 1,
                position: new Vector3(10, 0, 0),
            }),
            createArchGroup({
                height: 2,
                position: new Vector3(12, 0, 0),
            }),
        ];

        insideArches.forEach((arch) => {
            this.add(arch);
            const platform = arch.children.find(
                (child) => child.name === 'platform',
            );
            if (platform) {
                this.collidingElements.push(platform);
            }
        });

        const endLevel = new InteractiveArea(ElementName.AREA_END_LEVEL);
        this.add(endLevel);
        this.collidingElements.push(endLevel);
        this.interactiveElements.push(endLevel);
        positionOnGrid(endLevel, new Vector3(11, 0, 0));

        this.collidingElements.forEach((element) => {
            if ((element as Mesh).geometry) {
                (element as Mesh).geometry.computeBoundsTree();
            }
        });
    }
}
