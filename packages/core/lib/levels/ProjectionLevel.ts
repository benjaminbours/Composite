// vendors
import { Group, Mesh, Object3D, Vector3 } from 'three';
// local
import {
    ElementName,
    createArchGroup,
    createBounce,
    createWall,
    positionOnGrid,
} from './levels.utils';
import { Levels, ProjectionLevelState } from '../GameState';
import { Side } from '../types';
import { ElementToBounce, InteractiveArea } from '../elements';

export class ProjectionLevel extends Group {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'projection-level';
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

    public state: ProjectionLevelState = {
        bounces: {},
        id: Levels.LEARN_TO_FLY,
        end_level: [],
    };

    constructor() {
        super();
        const wallBlockingLeftPath = createWall(
            new Vector3(4, 2, 0),
            new Vector3(-3.5, 0, 2),
            new Vector3(0, 90, 0),
        );
        this.add(wallBlockingLeftPath);
        this.collidingElements.push(wallBlockingLeftPath);

        const arches = [
            createArchGroup(3, new Vector3(0, 0, 0)),
            createArchGroup(3, new Vector3(1, 0, 0), false),
            createArchGroup(3, new Vector3(2, 0, 0)),
            createArchGroup(4, new Vector3(5, 0, 0)),
            createArchGroup(3.25, new Vector3(6, 0, 0)),
            createArchGroup(2.5, new Vector3(7, 0, 0), false),
            createArchGroup(2.5, new Vector3(8, 0, 0), false),
            createArchGroup(2.5, new Vector3(9, 0, 0)),
            createArchGroup(2.5, new Vector3(10, 0, 0)),
            createArchGroup(2.5, new Vector3(11, 0, 0)),
            createArchGroup(4, new Vector3(10.5, 0, 0)),
            createArchGroup(4, new Vector3(11.5, 0, 0), false),
            createArchGroup(4, new Vector3(12.5, 0, 0), false),
            createArchGroup(4, new Vector3(13.5, 0, 0)),
            createArchGroup(6.5, new Vector3(10.5, 0, 0)),
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

        const bounceList = [
            {
                id: 0,
                side: Side.SHADOW,
                position: new Vector3(1, 0.5, 0),
                // initialRotation: 0, // success rotation
                initialRotation: -25,
            },
            {
                id: 1,
                side: Side.LIGHT,
                position: new Vector3(3, 1.75, 0),
                initialRotation: -45,
                // initialRotation: -25, // success rotation
            },
            {
                id: 2,
                side: Side.SHADOW,
                position: new Vector3(7, 5, 0),
                initialRotation: -45,
                // initialRotation: 0, // success rotation
            },
            {
                id: 3,
                side: Side.LIGHT,
                position: new Vector3(12, 5, 0),
                initialRotation: -45,
                // initialRotation: 25, // success rotation
            },
        ];

        bounceList.forEach(({ position, initialRotation, side, id }) => {
            const bounce = createBounce(position, initialRotation, side, id);
            this.add(bounce);
            this.collidingElements.push(bounce);
            this.state.bounces[id] = { rotationY: initialRotation };

            if (side === Side.LIGHT) {
                this.lightBounces.push(bounce);
            }
            this.bounces.push(bounce);
        });

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
