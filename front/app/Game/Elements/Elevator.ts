import { MysticPlace } from './MysticPlace';

export class Elevator extends MysticPlace {
    constructor(particlesNumber: number, height: number) {
        super(particlesNumber, height);
    }

    public update = (delta: number) => {
        this.detectActivation(this.activateVFX, this.deactivateVFX);
        this.updateShader(delta);
    };
}
