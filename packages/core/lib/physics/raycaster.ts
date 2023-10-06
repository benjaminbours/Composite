import { Vector3, Raycaster, Intersection, Object3D, Vec2 } from 'three';

export interface INearestObjects {
    right?: Intersection;
    left?: Intersection;
    up?: Intersection;
    down?: Intersection;
}

const RAYS = {
    right: new Vector3(1, 0, 0),
    left: new Vector3(-1, 0, 0),
    up: new Vector3(0, 1, 0),
    down: new Vector3(0, -1, 0),
};

const RAYCASTER = new Raycaster();

export function getNearestObjects(
    position: Vec2,
    obstacles: Object3D[],
): INearestObjects {
    const nearestObjects: INearestObjects = {};

    const directions = Object.keys(RAYS) as (keyof typeof RAYS)[];
    for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];

        const ray = RAYS[direction];
        RAYCASTER.set(new Vector3(position.x, position.y, 0), ray);

        const intersectObjects = RAYCASTER.intersectObjects(obstacles, true);
        const nearestObject = intersectObjects[0];

        if (!intersectObjects.length) {
            continue;
        }

        nearestObjects[direction] = nearestObject;
    }

    return nearestObjects;
}
