// vendors
import { Group, Object3D, Vector3 } from 'three';
// local
import {
    ElementName,
    createArchGroup,
    createWall,
    createWallDoor,
    positionOnGrid,
} from './levels.utils';
import { InteractiveArea } from '../elements/InteractiveArea';
import { Levels, ProjectionLevelState } from '../GameState';

export class ProjectionLevel extends Group {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'projection-level';

    public startPosition = {
        light: new Vector3(10, 20, 0), // start level
        shadow: new Vector3(200, 20, 0),
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
            createArchGroup(3, new Vector3(5, 0, 0)),
            createArchGroup(2, new Vector3(2, 0, 0)),
            createArchGroup(3, new Vector3(10, 0, 0)),
        ];

        arches.forEach((arch) => {
            this.add(arch);
            // TODO: Add only the platform to the list of colliding elements
            this.collidingElements.push(arch);
        });
    }
}
