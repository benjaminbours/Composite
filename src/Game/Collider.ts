import { Vector3, Raycaster, Intersection } from "three";
import Player from "./Player";
import { ArrCollidingElem } from "./types";

type NearestObject = null | Intersection;

interface INearestObjects {
    right: NearestObject;
    left: NearestObject;
    up: NearestObject;
    down: NearestObject;
}

export default class Collider {
    public static nearestObjects: INearestObjects = {
        right: null,
        left: null,
        up: null,
        down: null,
    };

    public static detectCollision(player: Player, obstacles: ArrCollidingElem) {
        for (const direction in this.rays) {
            const ray = this.rays[direction];
            this.raycaster.set(player.position, ray);

            const intersectObjects = this.raycaster.intersectObjects(obstacles, true);
            const nearestObject = intersectObjects[0];

            if (!intersectObjects.length) {
                this.nearestObjects[direction] = null;
                continue;
            }

            if (direction === "down") {
                if (player.position.y + player.velocity.y < player.range.y + nearestObject.point.y) {
                    this.nearestObjects[direction] = nearestObject;
                } else {
                    this.nearestObjects[direction] = null;
                }
            }

            if (direction === "right") {
                if (player.position.x + player.velocity.x + player.range.x > nearestObject.point.x) {
                    this.nearestObjects[direction] = nearestObject;
                } else {
                    this.nearestObjects[direction] = null;
                }
            }

            if (direction === "left") {
                if (player.position.x + player.velocity.x < player.range.x + nearestObject.point.x) {
                    this.nearestObjects[direction] = nearestObject;
                } else {
                    this.nearestObjects[direction] = null;
                }
            }
        }
    }

    private static raycaster = new Raycaster();

    private static rays = {
        right: new Vector3(1, 0, 0),
        left: new Vector3(-1, 0, 0),
        up: new Vector3(0, 1, 0),
        down: new Vector3(0, -1, 0),
    };
}
