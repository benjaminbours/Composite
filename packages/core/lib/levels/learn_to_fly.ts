// vendors
import { Group, Mesh, Object3D, Object3DEventMap, Vector3 } from 'three';
// local
import {
    ElementName,
    AbstractLevel,
    createArchGroup,
    createBounce,
    createWall,
    positionOnGrid,
    BounceDefinition,
} from './levels.utils';
import { Levels, LevelState } from '../GameState';
import { Side } from '../types';
import { ElementToBounce, InteractiveArea } from '../elements';

export class LearnToFlyLevel extends Group implements AbstractLevel {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'learn-to-fly';
    public lightBounces: ElementToBounce[] = [];
    public bounces: ElementToBounce[] = [];

    public startPosition = {
        light: new Vector3(10, 20), // start level
        shadow: new Vector3(200, 20, 0),
        // light: new Vector3(400, 900, 0), // first platform
        // shadow: new Vector3(1089, 20, 0), // first platform

        // light: new Vector3(1300, 1100, 0), // second platform
        // shadow: new Vector3(1300, 1100, 0), // second platform

        // light: new Vector3(2700, 1100, 0), // third platform
        // shadow: new Vector3(2700, 1100, 0), // third platform
    };

    public state: LevelState = {
        doors: {},
        bounces: {},
        id: Levels.LEARN_TO_FLY,
        end_level: [],
    };

    public doors: {
        wall: Object3D<Object3DEventMap>;
        openerPosition: Vector3;
    }[] = [];

    constructor() {
        super();
        const walls = [
            // blocking left path
            createWall({
                size: new Vector3(4, 5, 0),
                position: new Vector3(-3.5, 0, 2),
                rotation: new Vector3(0, 90, 0),
            }),
            // blocking right path
            createWall({
                size: new Vector3(4, 8, 0),
                position: new Vector3(14, 0, 2),
                rotation: new Vector3(0, 90, 0),
            }),
        ];

        walls.forEach((wall) => {
            this.add(wall);
            this.collidingElements.push(wall);
        });

        const arches = [
            createArchGroup({
                height: 3,
                position: new Vector3(0, 0, 0),
            }),
            createArchGroup({
                height: 3,
                position: new Vector3(1, 0, 0),
                withoutColumns: true,
            }),
            createArchGroup({
                height: 3,
                position: new Vector3(2, 0, 0),
            }),
            createArchGroup({
                height: 4,
                position: new Vector3(5, 0, 0),
            }),
            createArchGroup({
                height: 3.25,
                position: new Vector3(6, 0, 0),
            }),
            createArchGroup({
                height: 2.5,
                position: new Vector3(7, 0, 0),
            }),
            createArchGroup({
                height: 2.5,
                position: new Vector3(8, 0, 0),
                withoutColumns: true,
            }),
            createArchGroup({
                height: 2.5,
                position: new Vector3(9, 0, 0),
                withoutColumns: true,
            }),
            createArchGroup({
                height: 2.5,
                position: new Vector3(10, 0, 0),
                withoutColumns: true,
            }),
            createArchGroup({
                height: 2.5,
                position: new Vector3(11, 0, 0),
            }),
            createArchGroup({
                height: 4,
                position: new Vector3(10.5, 0, 0),
            }),
            createArchGroup({
                height: 4,
                position: new Vector3(11.5, 0, 0),
                withoutColumns: true,
            }),
            createArchGroup({
                height: 4,
                position: new Vector3(12.5, 0, 0),
                withoutColumns: true,
            }),
            createArchGroup({
                height: 4,
                position: new Vector3(13.5, 0, 0),
            }),
            createArchGroup({
                height: 6.5,
                position: new Vector3(10.5, 0, 0),
            }),
        ];

        arches.forEach((arch) => {
            this.add(arch);
            const platform = arch.children.find(
                (child) => child.name === 'platform',
            );
            if (platform) {
                this.collidingElements.push(platform);
            }
        });

        const bounceList: BounceDefinition[] = [
            {
                side: Side.SHADOW,
                position: new Vector3(1, 0.5, 0),
                // initialRotation: 0, // success rotation
                rotationY: -25,
            },
            {
                side: Side.SHADOW,
                position: new Vector3(0, 0.5, 0),
                // rotationY: 0, // success rotation
                rotationY: -25,
                interactive: true,
            },
            {
                side: Side.LIGHT,
                position: new Vector3(3, 0.5, 0),
                rotationY: -45,
                interactive: false,
                // rotationY: -25, // success rotation
            },
            {
                side: Side.LIGHT,
                position: new Vector3(4, 0.5, 0),
                rotationY: -45,
                interactive: true,
                // rotationY: -25, // success rotation
            },
            {
                side: Side.SHADOW,
                position: new Vector3(7, 5, 0),
                rotationY: -45,
                // rotationY: 0, // success rotation
            },
            {
                side: Side.LIGHT,
                position: new Vector3(12, 5, 0),
                rotationY: -45,
                // rotationY: 25, // success rotation
            },
        ];

        bounceList.forEach(
            ({ position, rotationY, side, interactive }, index) => {
                const bounce = createBounce(
                    position,
                    rotationY,
                    side,
                    index,
                    interactive || false,
                );
                this.add(bounce);
                this.collidingElements.push(bounce);
                this.state.bounces![index] = { rotationY };

                if (side === Side.LIGHT) {
                    this.lightBounces.push(bounce);
                }
                this.bounces.push(bounce);
            },
        );

        const endLevel = new InteractiveArea(ElementName.AREA_END_LEVEL);
        this.add(endLevel);
        this.collidingElements.push(endLevel);
        this.interactiveElements.push(endLevel);
        positionOnGrid(endLevel, new Vector3(10.5, 6.525, 0));

        this.collidingElements.forEach((element) => {
            if ((element as Mesh).geometry) {
                (element as Mesh).geometry.computeBoundsTree();
            }
        });
    }
}
