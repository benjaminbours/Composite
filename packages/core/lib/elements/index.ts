import { CircleGeometry, Mesh } from 'three';
import { Layer } from '../types';
import { materials } from '../levels';

export * from './InteractiveArea';
export * from './ElementToBounce';

export const FLOOR = new Mesh(new CircleGeometry(10000, 10), materials.phong);
FLOOR.layers.enable(Layer.BLOOM);
FLOOR.layers.enable(Layer.OCCLUSION_PLAYER);
FLOOR.receiveShadow = true;
FLOOR.name = 'floor';
FLOOR.rotation.x = -Math.PI / 2;
