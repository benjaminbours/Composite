import { Vector3 } from 'three';

export class WallProperties {
    public size: Vector3 = new Vector3(1, 1, 1);
    public position: Vector3 = new Vector3(0, 0, 0);
}

export enum ElementType {
    WALL = 'wall',
    WALL_DOOR = 'wall_door',
    ARCH = 'arch',
    BOUNCE = 'bounce',
    END_LEVEL = 'end_level',
    FAT_COLUMN = 'fat_column',
}

export interface LevelElement {
    name: string;
    type: ElementType;
    properties: Record<string, any>;
}

export interface ElementLibraryItem {
    type: ElementType;
    /**
     * src of the image
     */
    img: string;
    name: string;
}
