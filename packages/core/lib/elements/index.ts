import { CircleGeometry, Mesh, MeshPhongMaterial } from 'three';

export * from './InteractiveArea';
export * from './BounceElement';

export const FLOOR = new Mesh(
    new CircleGeometry(10000, 10),
    new MeshPhongMaterial({
        // color: 0x000000,
        // side: DoubleSide,
        // specular: 0x000000,
        shininess: 0,
        // transparent: true,
    }),
);
FLOOR.receiveShadow = true;
FLOOR.name = 'floor';
FLOOR.rotation.x = -Math.PI / 2;
