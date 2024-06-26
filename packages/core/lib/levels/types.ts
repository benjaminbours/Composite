import { Euler, Object3D, Vector3 } from 'three';
import ShortUniqueId from 'short-unique-id';
import { Side } from '../types';

export class WallProperties {
    public size = new Vector3(1, 1, 1);
    public transform = {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
    };
}

export class ArchProperties {
    public size = new Vector3(1, 1, 1);
    public transform = {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
    };
}

export class BounceProperties {
    // public size = new Vector3(1, 1, 1);
    public transform = {
        position: new Vector3(0, 0, 0),
        // degrees
        rotation: new Euler(90, 0, 0),
    };
    public side = Side.SHADOW;
    public interactive = false;
    public id = new ShortUniqueId({ length: 6 }).rnd();

    constructor() {}
}

export class EndLevelProperties {
    public transform = {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
    };
}

export class ColumnFatProperties {
    public size = new Vector3(1, 1, 1);
    public transform = {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
    };
}

export class WallDoorProperties {
    public size = new Vector3(1, 1, 1);
    public doorPosition = new Vector3(0, 0, 0);
    public transform = {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
    };
    public id = new ShortUniqueId({ length: 6 }).rnd();

    constructor() {}
}

export class DoorOpenerProperties {
    public transform = {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
    };
    public door_id: string | undefined = undefined;
    public id = new ShortUniqueId({ length: 6 }).rnd();

    constructor() {}
}

export enum ElementType {
    WALL = 'wall',
    WALL_DOOR = 'wall_door',
    DOOR_OPENER = 'door_opener',
    ARCH = 'arch',
    BOUNCE = 'bounce',
    END_LEVEL = 'end_level',
    FAT_COLUMN = 'fat_column',
}

export type ElementProperties =
    | WallProperties
    | ArchProperties
    | BounceProperties
    | EndLevelProperties
    | ColumnFatProperties
    | WallDoorProperties
    | DoorOpenerProperties;

export interface LevelElement {
    id: string;
    name: string;
    type: ElementType;
    properties: ElementProperties;
    mesh: Object3D;
    isLocked?: boolean;
}
