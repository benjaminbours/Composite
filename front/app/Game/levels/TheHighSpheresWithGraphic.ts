// vendors
import { Vector3 } from 'three';
// our libs
import {
    ElementName,
    ElementToBounce,
    Side,
    TheHighSpheresLevel,
} from '@benjaminbours/composite-core';
// local
import { DoorOpenerGraphic } from '../elements/DoorOpenerGraphic';
import { EndLevel } from '../elements/EndLevel';
import { Pulse } from '../elements/Pulse';
import { SkinBounce } from '../elements/SkinBounce';
import { SkinBounceShadow } from '../elements/SkinBounceShadow';

export class TheHighSpheresLevelWithGraphic extends TheHighSpheresLevel {
    constructor() {
        super();

        this.doors.forEach((_, index) => {
            // TODO: Might be more optimized to search in children of wall and not of all level children
            const wallDoor = this.children.find(
                (child) => child.name === ElementName.WALL_DOOR(String(index)),
            )!;
            const doorLeft = wallDoor.children.find(
                (child) => child.name === 'doorLeft',
            );
            const doorRight = wallDoor.children.find(
                (child) => child.name === 'doorRight',
            );
            const doorWorldPosition = doorLeft!.getWorldPosition(new Vector3());

            const area = this.children.find(
                (child) =>
                    child.name === ElementName.AREA_DOOR_OPENER(String(index)),
            )!;
            const sign =
                doorWorldPosition.x - area.getWorldPosition(new Vector3()).x > 0
                    ? -1
                    : 1;

            console.log('HERE', doorLeft, doorRight);

            const cameraPosition = new Vector3(100 * sign, 200);
            const doorOpener = new DoorOpenerGraphic(
                ElementName.DOOR_OPENER(String(index)),
                // {
                //     cameraPosition: doorWorldPosition.add(cameraPosition),
                //     doorLeft: doorLeft!,
                //     doorRight: doorRight!,
                // },
            );
            area.add(doorOpener);
        });

        this.children.forEach((child) => {
            if (child.name.includes('BOUNCE')) {
                const bounce = child as ElementToBounce;
                const side = Number(child.name.replace('_BOUNCE', '')) as Side;

                this.add(new SkinBounce(bounce));
                if (side === Side.LIGHT) {
                    // initialization of the skin is done with postprocessing, it is spread around the App class, at the root of the game rendering
                    if (bounce.interactive) {
                        console.log('HERE DUDE');

                        this.add(new Pulse(child as ElementToBounce));
                    }
                }

                if (side === Side.SHADOW) {
                    this.add(new SkinBounceShadow(bounce));
                }
            }
        });

        const endLevel = new EndLevel();
        const endArea = this.children.find(
            (child) => child.name === ElementName.AREA_END_LEVEL,
        )!;
        endArea.add(endLevel);
    }
}
