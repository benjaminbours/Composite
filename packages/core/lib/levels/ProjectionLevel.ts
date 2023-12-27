// vendors
import { Group, Object3D, Vector3 } from 'three';
// local
import { createArchGroup, createBounce, createWall } from './levels.utils';
import { Levels, ProjectionLevelState } from '../GameState';
import { Side } from '../types';
import { ElementToBounce } from '../elements';

export class ProjectionLevel extends Group {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'projection-level';
    public lightBounces: ElementToBounce[] = [];

    public startPosition = {
        // light: new Vector3(10, 20, 0), // start level
        shadow: new Vector3(0, 20, 0),
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
            new Vector3(-3.5, 0, 2),
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
            const platform = arch.children.find(
                (child) => child.name === 'platform',
            );
            if (platform) {
                this.collidingElements.push(platform);
            }
        });

        const bounce = createBounce(new Vector3(-1, 1, 0), -45, Side.SHADOW);
        this.add(bounce);
        this.collidingElements.push(bounce);

        const bounceLight = createBounce(new Vector3(0, 1, 0), 45, Side.LIGHT);
        this.add(bounceLight);
        this.collidingElements.push(bounceLight);
        this.lightBounces.push(bounceLight);

        // const bounceLight2 = createBounce(
        //     new Vector3(1.5, 2, 0),
        //     new Vector3(0, 90, 0),
        //     Side.LIGHT,
        // );
        // this.add(bounceLight2);
        // this.collidingElements.push(bounceLight2);
        // this.lightBounces.push(bounceLight2);

        // const bounceLight3 = createBounce(
        //     new Vector3(1.5, 4, 0),
        //     new Vector3(0, 90, 0),
        //     Side.LIGHT,
        // );
        // this.add(bounceLight3);
        // this.collidingElements.push(bounceLight3);
        // this.lightBounces.push(bounceLight3);
    }
}
