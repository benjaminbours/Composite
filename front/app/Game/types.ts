import type { Mesh, Group, BoxGeometry, Object3D } from 'three';
import type { MysticPlace } from './elements/MysticPlace';

export type Geometries = 'border' | 'platform' | 'wall' | 'mountain';

export type GeometriesRegistry = {
    [key: string]: unknown | BoxGeometry;
    // [key in Geometries]?: unknown | BoxGeometry;
};
export interface AssetInfo {
    type: 'jsonObj' | 'texture';
    url: string;
    name: Geometries;
    /**
     * Raw object loaded
     */
    raw?: unknown;
}

export type CollidingElem = Mesh | Group | MysticPlace | Object3D;
// export type InteractElem = MysticPlace;

// TODO: revoir l'utilité de ce fichier, la façon de load les assets à changers.
