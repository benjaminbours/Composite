// vendors
// our libs
import {
    ElementName,
    ElementToBounce,
    LearnToFlyLevel,
    Side,
} from '@benjaminbours/composite-core';
// local
import { SkinBounceShadow } from '../elements/SkinBounceShadow';
import { EndLevel } from '../elements/EndLevel';
import { SkinBounce } from '../elements/SkinBounce';
import { Pulse } from '../elements/Pulse';

export class LearnToFlyLevelWithGraphic extends LearnToFlyLevel {
    constructor() {
        super();

        this.children.forEach((child) => {
            if (child.name.includes('BOUNCE')) {
                const bounce = child as ElementToBounce;
                const side = Number(child.name.replace('_BOUNCE', '')) as Side;

                this.add(new SkinBounce(bounce));
                if (side === Side.LIGHT) {
                    // initialization of the skin is done with postprocessing, it is spread around the App class, at the root of the game rendering
                    if (bounce.interactive) {
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
