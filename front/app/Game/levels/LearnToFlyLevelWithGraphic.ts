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
import { Mesh } from 'three';
import { SkinBounce } from '../elements/SkinBounce';

export class LearnToFlyLevelWithGraphic extends LearnToFlyLevel {
    constructor() {
        super();

        this.children.forEach((child) => {
            if (child.name.includes('BOUNCE')) {
                const side = Number(child.name.replace('_BOUNCE', '')) as Side;

                this.add(new SkinBounce(child as ElementToBounce));
                if (side === Side.LIGHT) {
                    // initialization of the skin is done with postprocessing, it is spread around the App class, at the root of the game rendering
                }

                if (side === Side.SHADOW) {
                    console.log('apply skin shadow', (child as Mesh).geometry);
                    this.add(new SkinBounceShadow(child as ElementToBounce));
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
