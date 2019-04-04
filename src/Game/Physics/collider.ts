import { Vector3, Raycaster, Intersection } from "three";
import Player from "../Player";
import { ArrCollidingElem } from "../types";

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

export function detectPlayerCollision(player: Player, obstacles: ArrCollidingElem): INearestObjects {
    const nearestObjects: INearestObjects = {};

    for (const direction in RAYS) {
        const ray = RAYS[direction];
        RAYCASTER.set(player.position, ray);

        const intersectObjects = RAYCASTER.intersectObjects(obstacles, true);
        const nearestObject = intersectObjects[0];

        if (!intersectObjects.length) {
            continue;
        }

        if (direction === "down" && player.position.y + player.velocity.y < player.range.y + nearestObject.point.y) {
            nearestObjects[direction] = nearestObject;
        }

        if (direction === "right" && player.position.x + player.velocity.x + player.range.x > nearestObject.point.x) {
            nearestObjects[direction] = nearestObject;
        }

        if (direction === "left" && player.position.x + player.velocity.x < player.range.x + nearestObject.point.x) {
            nearestObjects[direction] = nearestObject;
        }
    }

    return nearestObjects;
}
