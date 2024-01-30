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

export class TheHighSpheresLevel extends Group implements AbstractLevel {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'the-high-spheres';
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
        id: Levels.THE_HIGH_SPHERES,
        doors: {},
        bounces: {},
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
            createArchGroup({
                height: 1,
                position: new Vector3(2, 0, 0),
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
    }
}
