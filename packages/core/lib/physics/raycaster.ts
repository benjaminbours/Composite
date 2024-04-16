import {
    Vector3,
    Raycaster,
    Intersection,
    Object3D,
    Vec2,
    Box3,
    type Object3DEventMap,
} from 'three';

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

const playerBBox = new Box3();
const obstacleBox = new Box3();
const positionVec = new Vector3();
const filterCollisionSize = new Vector3(100, 100, 0);
const RAYCASTER = new Raycaster();
(RAYCASTER as any).firstHitOnly = true;
let obstaclesToConsider: Object3D[] = [];
let intersectObjects: Intersection<Object3D<Object3DEventMap>>[] = [];

export function getNearestObjects(
    position: Vec2,
    obstacles: Object3D[],
): INearestObjects {
    const nearestObjects: INearestObjects = {};

    positionVec.set(position.x, position.y, 0);
    playerBBox.setFromCenterAndSize(positionVec, filterCollisionSize);

    obstaclesToConsider = [];

    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];
        obstacleBox.setFromObject(obstacle);
        if (playerBBox.intersectsBox(obstacleBox)) {
            obstaclesToConsider.push(obstacle);
        }
    }

    const directions = Object.keys(RAYS) as (keyof typeof RAYS)[];
    for (let i = 0; i < directions.length; i++) {
        const direction = directions[i];

        const ray = RAYS[direction];
        RAYCASTER.set(positionVec, ray);

        intersectObjects = [];
        RAYCASTER.intersectObjects(
            obstaclesToConsider,
            undefined,
            intersectObjects,
        );

        if (!intersectObjects.length) {
            continue;
        }

        nearestObjects[direction] = intersectObjects[0];
    }

    return nearestObjects;
}
