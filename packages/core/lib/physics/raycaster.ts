import { Vector3, Raycaster, Intersection, Object3D, Vec2, Box3 } from 'three';

export interface INearestObjects {
    right?: Intersection;
    left?: Intersection;
    top?: Intersection;
    bottom?: Intersection;
    // bottomRight?: Intersection;
    // bottomLeft?: Intersection;
    // topRight?: Intersection;
    // topLeft?: Intersection;
}

const RAYS = {
    right: new Vector3(1, 0, 0),
    left: new Vector3(-1, 0, 0),
    top: new Vector3(0, 1, 0),
    bottom: new Vector3(0, -1, 0),
    // bottomRight: new Vector3(1, -1, 0),
    // bottomLeft: new Vector3(-1, -1, 0),
    // topRight: new Vector3(1, 1, 0),
    // topLeft: new Vector3(-1, 1, 0),
};

const RAYCASTER = new Raycaster();
RAYCASTER.firstHitOnly = true;

export function getNearestObjects(
    position: Vec2,
    obstacles: Object3D[],
): INearestObjects {
    const nearestObjects: INearestObjects = {};

    // TODO: Can be optimize by filtering at a higher level.
    // like this, it is filtered once for each player
    const obstaclesToConsider = obstacles.filter((obstacle) => {
        const playerBBox = new Box3().setFromCenterAndSize(
            new Vector3(position.x, position.y, 0),
            new Vector3(100, 100, 0),
        );
        const obstacleBox = new Box3().setFromObject(obstacle);
        return playerBBox.intersectsBox(obstacleBox);
    });

    const directions = Object.keys(RAYS) as (keyof typeof RAYS)[];
    for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];

        const ray = RAYS[direction];
        RAYCASTER.set(new Vector3(position.x, position.y, 0), ray);

        const intersectObjects =
            RAYCASTER.intersectObjects(obstaclesToConsider);

        if (!intersectObjects.length) {
            continue;
        }

        nearestObjects[direction] = intersectObjects[0];
    }

    return nearestObjects;
}
