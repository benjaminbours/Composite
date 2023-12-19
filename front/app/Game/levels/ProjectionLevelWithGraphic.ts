// vendors
// our libs
import {
    ElementToBounce,
    ProjectionLevel,
    Side,
} from '@benjaminbours/composite-core';
// local
import { SkinBounceShadow } from '../elements/SkinBounceShadow';
import { EndLevel } from '../elements/EndLevel';
import { Mesh } from 'three';

export class ProjectionLevelWithGraphic extends ProjectionLevel {
    constructor() {
        super();

        this.children.forEach((child) => {
            if (child.name.includes('BOUNCE')) {
                const side = Number(child.name.replace('_BOUNCE', '')) as Side;

                if (side === Side.LIGHT) {
                    console.log('apply skin light');
                }

                if (side === Side.SHADOW) {
                    console.log('apply skin shadow', (child as Mesh).geometry);
                    this.add(new SkinBounceShadow(child as ElementToBounce));
                }
            }
        });

        // TODO: Position end level
        // const endLevel = new EndLevel();
        // const endArea = this.children.find(
        //     (child) => child.name === ElementName.AREA_END_LEVEL,
        // )!;
        // endArea.add(endLevel);
    }
}
