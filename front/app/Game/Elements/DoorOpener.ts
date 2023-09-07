import {
    BoxGeometry,
    // Clock,
    // DoubleSide,
    Mesh,
    // MeshPhongMaterial,
    MeshStandardMaterial,
    Object3D,
    RectAreaLight,
    Vector3,
} from 'three';
import { gsap } from 'gsap';
import { gridSize } from '../levels/levels.utils';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { InteractiveComponent } from '../Player/physics/movementHelpers';

interface DoorInfo {
    cameraPosition: Vector3;
    doorLeft: Object3D;
    doorRight: Object3D;
}

export class DoorOpener extends Object3D implements InteractiveComponent {
    public shouldActivate: boolean = false;
    public isActive: boolean = false;

    private rectLight: RectAreaLight;

    constructor(private doorInfo: DoorInfo) {
        super();

        RectAreaLightUniformsLib.init();

        const whiteBlockGeo = new BoxGeometry(gridSize / 2, 10, gridSize / 2);
        const whiteBlockMat = new MeshStandardMaterial({
            color: 0xffffff,
            // side: DoubleSide,
            // specular: 0x000000,
            // specular: 0xffffff,
            // shininess: 50,
            // transparent: true,
        });

        const whiteBlock = new Mesh(whiteBlockGeo, whiteBlockMat);
        this.add(whiteBlock);

        this.rectLight = new RectAreaLight(undefined, 0, gridSize, gridSize);
        this.rectLight.position.set(0, 100, 0);
        this.rectLight.lookAt(0, 0, 0);
        this.add(this.rectLight);
    }

    public update = () => {
        if (this.shouldActivate && !this.isActive) {
            this.isActive = true;
            gsap.to(this.rectLight, {
                duration: 1,
                intensity: 5,
                power: 100,
            });
            this.openTheDoor();
        }

        if (!this.shouldActivate && this.isActive) {
            this.isActive = false;
            gsap.to(this.rectLight, {
                duration: 1,
                intensity: 0,
            });
            this.closeTheDoor();
        }
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
