// vendors
import { Group, Object3D, Vector3, Object3DEventMap } from 'three';
// our libs
import {
    AbstractLevel,
    ElementToBounce,
    LevelState,
} from '@benjaminbours/composite-core';
// local

export class EmptyLevel extends Group implements AbstractLevel {
    public collidingElements: Object3D[] = [];
    public interactiveElements: any[] = [];
    public name = 'empty-level';
    public bounces: ElementToBounce[] = [];
    public lightBounces: ElementToBounce[] = [];

    public startPosition = {
        light: new Vector3(10, 20, 0), // start level
        shadow: new Vector3(200, 20, 0),
    };

    public state: LevelState = {
        id: 0,
        doors: {},
        bounces: {},
        end_level: [],
    };

    public doors: {
        wall: Object3D<Object3DEventMap>;
        openerPosition: Vector3;
    }[] = [];

    constructor() {
        super();
    }
}
