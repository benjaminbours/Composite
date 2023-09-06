import {
    BoxGeometry,
    // Clock,
    // DoubleSide,
    Mesh,
    // MeshPhongMaterial,
    MeshStandardMaterial,
    Object3D,
    RectAreaLight,
} from 'three';
import { gsap } from 'gsap';
import { gridSize } from '../levels/levels.utils';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';
import { InteractiveComponent } from '../Player/physics/movementHelpers';

export class DoorOpener extends Object3D implements InteractiveComponent {
    public shouldActivate: boolean = false;
    public isActive: boolean = false;

    private rectLight: RectAreaLight;

    constructor() {
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
        }

        if (!this.shouldActivate && this.isActive) {
            this.isActive = false;
            gsap.to(this.rectLight, {
                duration: 1,
                intensity: 0,
            });
        }
    };

    // update() {
    //     var delta = this.clock.getDelta();

    //     this.floating.material.uniforms.time.value += delta * 2;

    //     // if (this.floating.material.uniforms.time.value >= 50) {

    //     // let deltaReset = this.clock.getDelta();
    //     // this.floating.material.uniforms.time.value= 0.0
    //     // this.floating.material.uniforms.time.value += delta * 2;

    //     // }

    //     //////////////////////////////////////////

    //     if (this.playerOn || this.otherPlayerOn) {
    //         if (this.playerOn) {
    //             this.camera.targetCamera(this.linkedDoor.cameraPosition, 20);
    //             this.socketManager.emitOnMysticPlace(this.linkedDoor.name);
    //         }

    //         if (this.otherPlayerOn) {
    //         }
    //     } else {
    //         this.doorOpen = false;
    //         this.closeTheDoor();
    //     }
    // }

    // setLinkedDoorCamera(vector) {
    //     this.linkedDoor.cameraPosition.copy(vector);
    // }

    // getDoorLinked(linkedDoorName) {
    //     let doorLeft;
    //     let doorRight;

    //     for (let i in this.decor[linkedDoorName].children) {
    //         if (this.decor[linkedDoorName].children[i].name == 'doorLeft') {
    //             doorLeft = this.decor[linkedDoorName].children[i];
    //         }

    //         if (this.decor[linkedDoorName].children[i].name == 'doorRight') {
    //             doorRight = this.decor[linkedDoorName].children[i];
    //         }
    //     }

    //     const linkedDoor = {
    //         doorLeft: doorLeft,
    //         doorRight: doorRight,
    //         name: linkedDoorName,
    //         cameraPosition: new THREE.Vector3(),
    //     };

    //     return linkedDoor;
    // }

    // openTheDoor() {
    //     // TODO: les portes se refermes si elles ne se sont pas ouvertes completement.

    //     if (this.linkedDoor.doorRight.position.z >= -70) {
    //         this.linkedDoor.doorRight.position.z -= 5;
    //     } else {
    //         this.doorOpen = true;
    //     }

    //     if (this.linkedDoor.doorLeft.position.z <= 70) {
    //         this.linkedDoor.doorLeft.position.z += 5;
    //     } else {
    //         this.doorOpen = true;
    //     }
    // }

    // closeTheDoor() {
    //     if (this.linkedDoor.doorRight.position.z <= 0) {
    //         this.linkedDoor.doorRight.position.z += 15;
    //     } else {
    //         this.doorOpen = false;
    //     }

    //     if (this.linkedDoor.doorLeft.position.z >= 0) {
    //         this.linkedDoor.doorLeft.position.z -= 15;
    //     } else {
    //         this.doorOpen = false;
    //     }
    // }
}
