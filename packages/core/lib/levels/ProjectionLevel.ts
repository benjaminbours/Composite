// vendors
import { Group, Object3D, Vector3 } from 'three';
// local
import {
    ElementName,
    createArchGroup,
    createBounce,
    createWall,
    createWallDoor,
    positionOnGrid,
} from './levels.utils';
import { InteractiveArea } from '../elements/InteractiveArea';
import { Levels, ProjectionLevelState } from '../GameState';
import { Side } from '../types';

export class ProjectionLevel extends Group {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'projection-level';

    public startPosition = {
        // light: new Vector3(10, 20, 0), // start level
        shadow: new Vector3(200, 20, 0),
        light: new Vector3(1089, 275, 0), // first platform
    };

    public state: ProjectionLevelState = {
        id: Levels.LEARN_TO_FLY,
        end_level: [],
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
            createArchGroup(1, new Vector3(4, 0, 0)),
            createArchGroup(4, new Vector3(5, 0, 0)),
            createArchGroup(3, new Vector3(2, 0, 0)),
            createArchGroup(4, new Vector3(10, 0, 0)),
        ];

        arches.forEach((arch) => {
            this.add(arch);
            // TODO: Add only the platform to the list of colliding elements
            this.collidingElements.push(arch);
        });

        const bounce = createBounce(
            new Vector3(4.5, 2, 0),
            new Vector3(0, 90, 0),
            Side.LIGHT,
        );
        this.add(bounce);
        this.collidingElements.push(bounce);
    }
}
