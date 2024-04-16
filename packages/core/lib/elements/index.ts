import { CircleGeometry, Group, Mesh } from 'three';
import { Layer } from '../types';
import { materials } from '../levels';

export * from './InteractiveArea';
export * from './ElementToBounce';

const FLOOR = new Mesh(new CircleGeometry(10000, 10), materials.phong);
FLOOR.receiveShadow = true;
FLOOR.name = 'floor';
FLOOR.rotation.x = -Math.PI / 2;

const OCCLUSION_FLOOR = FLOOR.clone();
OCCLUSION_FLOOR.material = materials.occlusion;
OCCLUSION_FLOOR.layers.set(Layer.OCCLUSION);
OCCLUSION_FLOOR.layers.enable(Layer.OCCLUSION_PLAYER);

export const FLOOR_GROUP = new Group();
FLOOR_GROUP.add(FLOOR, OCCLUSION_FLOOR);
