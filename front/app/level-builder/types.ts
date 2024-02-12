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

export enum ElementType {
    WALL = 'wall',
    WALL_DOOR = 'wall_door',
    ARCH = 'arch',
    BOUNCE = 'bounce',
    END_LEVEL = 'end_level',
    FAT_COLUMN = 'fat_column',
}

export type ElementProperties =
    | WallProperties
    | ArchProperties
    | BounceProperties;

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
