import { Side } from '@benjaminbours/composite-core';
import { Euler, Object3D, Vector3 } from 'three';

export class WallProperties {
    public size = new Vector3(1, 1, 1);
    public position = new Vector3(0, 0, 0);
    public rotation = new Euler(0, 0, 0);
}

export class ArchProperties {
    public size = new Vector3(1, 1, 1);
    public position = new Vector3(0, 0, 0);
}

export class BounceProperties {
    // public size = new Vector3(1, 1, 1);
    public position = new Vector3(0, 0, 0);
    // degrees
    public rotation = new Euler(90, 0, 0);
    public side = Side.SHADOW;
    public interactive = false;

    constructor(public id: number) {}
}

export class EndLevelProperties {
    public position = new Vector3(0, 0, 0);
}

export class ColumnFatProperties {
    public size = new Vector3(1, 1, 1);
    public position = new Vector3(0, 0, 0);
}

export class WallDoorProperties {
    public size = new Vector3(1, 1, 1);
    public position = new Vector3(0, 0, 0);
    public doorPosition = new Vector3(0, 0, 0);
    public rotation = new Euler(0, 0, 0);

    constructor(public id: number) {}
}

export class DoorOpenerProperties {
    public position = new Vector3(0, 0, 0);
    public door_id: number = 0;
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

export interface ElementLibraryItem {
    type: ElementType;
    /**
     * src of the image
     */
    img: string;
    name: string;
}
