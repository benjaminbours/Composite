import { Object3D } from 'three';

export class Player extends Object3D {
    constructor(public isMainPlayer: boolean) {
        super();
    }
}
