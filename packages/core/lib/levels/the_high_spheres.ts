// vendors
import { Group, Object3D, Vector3, Mesh, Object3DEventMap, Euler } from 'three';
// local
import {
    ElementName,
    AbstractLevel,
    createArchGroup,
    createWall,
    createWallDoor,
    positionOnGrid,
    createColumnGroup,
    createBounce,
    BounceOptions,
} from './levels.utils';
import { InteractiveArea } from '../elements/InteractiveArea';
import { LevelState } from '../GameState';
import { ElementToBounce } from '../elements';
import { Side } from '../types';

export class TheHighSpheresLevel extends Group implements AbstractLevel {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'the-high-spheres';
    public bounces: ElementToBounce[] = [];
    public lightBounces: ElementToBounce[] = [];

    public startPosition = {
        // light: new Vector3(-200, 20, 0), // start level
        // shadow: new Vector3(200, 20, 0),
        // shadow: new Vector3(2200, 775, 0), // roof door
        // light: new Vector3(2500, 20, 0), // end level
        // shadow: new Vector3(200, 1000, 0), // roof
        light: new Vector3(200, 1000, 0), // roof
        shadow: new Vector3(1700, 1500, 0), // second roof
    };

    public state: LevelState = {
        id: 666,
        doors: {},
        bounces: {},
        end_level: [],
    };

    public doors: {
        wall: Object3D<Object3DEventMap>;
        openerPosition: Vector3;
    }[];

    constructor() {
        super();

        const walls = [
            // blocking left path
            createWall({
                size: new Vector3(4, 5, 0),
                position: new Vector3(-4, 0, 2),
                rotation: new Euler(0, 90, 0),
            }),
            // intro wall on top, roof
            createWall({
                size: new Vector3(4, 4, 0),
                position: new Vector3(0, 3, -1),
                rotation: new Euler(90, 0, 90),
                withOcclusion: true,
            }),
            // roof on top of door
            createWall({
                size: new Vector3(3, 3, 0),
                position: new Vector3(4, 5.75, -2),
                rotation: new Euler(90, 0, 0),
            }),
            // background first wall
            createWall({
                size: new Vector3(3, 5.75, 0),
                position: new Vector3(4, 0, -2),
                rotation: new Euler(0, 0, 0),
            }),
        ];

        walls.forEach((wall) => {
            this.add(wall);
            this.collidingElements.push(wall);
        });

        const arches = [
            createArchGroup({
                size: new Vector3(1, 1, 1),
                position: new Vector3(-1, 0, 0),
            }),
            createArchGroup({
                size: new Vector3(1, 1, 1),
                position: new Vector3(1, 0, 0),
            }),
        ];

        const columnsBig = [
            {
                mesh: createColumnGroup(3, 'big'),
                position: new Vector3(-1, 0, -2),
            },
            {
                mesh: createColumnGroup(3, 'big'),
                position: new Vector3(1, 0, -2),
            },
        ];

        columnsBig.forEach(({ mesh, position }) => {
            positionOnGrid(mesh, position);
            this.add(mesh);
        });

        arches.forEach((arch) => {
            this.add(arch);
            const platform = arch.children.find(
                (child) => child.name === 'platform',
            );
            if (platform) {
                this.collidingElements.push(platform);
            }
        });

        const bounceList: any[] = [
            {
                side: Side.SHADOW,
                position: new Vector3(-1, 2, 0),
                rotation: new Euler(0, 60, 0),
            },
            {
                side: Side.LIGHT,
                position: new Vector3(1, 2, 0),
                rotation: new Euler(0, -60, 0),
            },
            {
                side: Side.LIGHT,
                position: new Vector3(3, 4, 0),
                rotation: new Euler(0, -20, 0),
                interactive: true,
            },
        ];

        // bounceList.forEach(
        //     ({ position, rotation, side, interactive }, index) => {
        //         const bounce = createBounce({
        //             size: new Vector3(1, 1, 1),
        //             position,
        //             rotation,
        //             side,
        //             id: index,
        //             interactive: interactive || false,
        //         });
        //         this.add(bounce);
        //         this.collidingElements.push(bounce);
        //         this.state.bounces![index] = { rotationY: rotation };

        //         if (side === Side.LIGHT) {
        //             this.lightBounces.push(bounce);
        //         }
        //         this.bounces.push(bounce);
        //     },
        // );

        this.doors = [
            // {
            //     wall: createWallDoor({
            //         size: new Vector3(0, 5.75, 0),
            //         position: new Vector3(4, 0, 0),
            //         doorPosition: new Vector3(0, 3, 0),
            //         rotation: new Euler(0, 0, 0),
            //         // orientation: 'vertical',
            //     }),
            //     openerPosition: new Vector3(6, 5.75, 0),
            //     // openerPosition: new Vector3(0, 3.1, 0),
            // },
        ];

        this.doors.forEach(({ wall, openerPosition }, index) => {
            this.state.doors[index] = [];
            wall.name = ElementName.WALL_DOOR(String(index));
            this.add(wall);
            this.collidingElements.push(wall);

            const doorOpener = new InteractiveArea(
                ElementName.AREA_DOOR_OPENER(String(index)),
            );
            this.collidingElements.push(doorOpener);
            this.interactiveElements.push(doorOpener);
            positionOnGrid(doorOpener, openerPosition);
            this.add(doorOpener);
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
