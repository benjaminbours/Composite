import { Euler, Object3D, Vector3 } from 'three';
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

    constructor(public id: number) {}
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

    constructor(public id: number) {}
}

export class DoorOpenerProperties {
    public transform = {
        position: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
    };
    public door_id: number | undefined = undefined;
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
    name: string;
    type: ElementType;
    properties: ElementProperties;
    mesh: Object3D;
}
