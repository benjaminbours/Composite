import { Object3D, Vector3 } from 'three';
import { gsap } from 'gsap';
import CustomCamera from '../CustomCamera';
import { MysticPlace } from './MysticPlace';

interface DoorInfo {
    cameraPosition: Vector3;
    doorLeft: Object3D;
    doorRight: Object3D;
}

export class DoorOpener extends MysticPlace {
    constructor(
        private doorInfo: DoorInfo,
        particlesNumber: number,
        height: number,
    ) {
        super(particlesNumber, height);
    }

    // TODO: Think about using a door opening system to manage this logic
    // I don't like the fact its the element door opener who set the camera target
    public update = (delta: number, camera: CustomCamera) => {
        this.detectActivation(this.activate(camera), this.deactivate(camera));
        this.updateShader(delta);
    };

    activate = (camera: CustomCamera) => () => {
        camera.setTarget(this.doorInfo.cameraPosition);
        this.activateVFX();
        this.openTheDoor();
    };

    deactivate = (camera: CustomCamera) => () => {
        camera.setTarget(undefined);
        this.deactivateVFX();
        // this.closeTheDoor();
    };

    openTheDoor = () => {
        gsap.to(this.doorInfo.doorLeft.position, {
            duration: 1,
            x: -100,
            overwrite: true,
        });
        gsap.to(this.doorInfo.doorRight.position, {
            duration: 1,
            x: 100,
            overwrite: true,
        });
    };

    closeTheDoor = () => {
        gsap.to(
            [this.doorInfo.doorLeft.position, this.doorInfo.doorRight.position],
            {
                duration: 0.5,
                x: 0,
                overwrite: true,
            },
        );
    };
}
