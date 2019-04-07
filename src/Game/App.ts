import * as THREE from "three";
import { Mesh, IFog, Clock, DirectionalLight, Object3D, Group } from "three";
import SkyShader from "./SkyShader";
import Inputs from "./Player/Inputs";
import Player from "./Player";
import Level from "./Level";
import CustomCamera from "./CustomCamera";
import { CollidingElem } from "./types";
import { MysticPlace } from "./Elements/MysticPlace";

export default class App {
    private scene = new THREE.Scene();
    private camera = new CustomCamera(75, window.innerWidth / window.innerHeight, 0.1, 12000);
    private renderer: THREE.WebGLRenderer;

    private player: Player;
    private skyMesh: Mesh;

    // private clock = new Clock();
    private dirLight = new DirectionalLight(0xFFFFEE, 0.5);

    private floor: Mesh;

    private collidingElements: CollidingElem[] = [];
    // private interactElements: InteractElem[] = [];

    constructor(canvasDom: HTMLCanvasElement) {
        // inputs
        Inputs.init();

        // render
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasDom,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        // dirlight
        this.dirLight.castShadow = true;
        this.dirLight.position.set(-2, 1, 2);
        this.dirLight.target = new THREE.Object3D();
        this.scene.add(this.dirLight.target);
        this.scene.add(this.dirLight);

        // hemisphere light
        const ambient = new THREE.HemisphereLight(0xFFFFFF, 0x000000, .1);
        this.scene.add(ambient);

        this.scene.fog = new THREE.FogExp2(0xFFFFFF, 0.0006);

        // this.camera.position.z = 5;
        this.camera.position.z = 300;
        this.camera.position.y = 10;

        // sky
        const skyShaterMat = new SkyShader(this.camera);
        const skyBox = new THREE.IcosahedronGeometry(3000, 1);
        this.skyMesh = new THREE.Mesh(skyBox, skyShaterMat);
        this.skyMesh.rotation.set(0, 1, 0);
        // this.scene.add(this.skyMesh);

        // floor
        this.floor = new THREE.Mesh(
            new THREE.CircleGeometry(10000, 10),
            new THREE.MeshPhongMaterial({ color: 0x000000, side: THREE.DoubleSide, specular: 0x000000, shininess: 0, transparent: true }),
        );
        this.floor.receiveShadow = true;
        this.floor.rotation.x = -Math.PI * .5;
        this.floor.position.x = 3.5;
        this.scene.add(this.floor);
        this.collidingElements.push(this.floor);

        // mystic place test
        const mysticPlace = new MysticPlace(200);
        this.scene.add(mysticPlace);
        this.collidingElements.push(mysticPlace);

        // level
        // const level = new Level();
        // this.scene.add(level);
        // this.collidingElements.push(level);

        // player
        this.player = new Player();
        // this.player.position.set(-50, 0, 0);
        // this.player.position.set(-8000, 0, 0);
        this.camera.playerPosition.x = this.player.position.x;
        this.camera.playerPosition.y = this.player.position.y;
        this.scene.add(this.player);
        console.log(this.scene.children);
    }

    public render = () => {
        const skyShaderMat = (this.skyMesh.material as SkyShader);
        this.renderer.render(this.scene, this.camera);

        // update everything which need an update in the scene
        for (const item of this.scene.children as any) {
            if (item.hasOwnProperty("render")) {

                switch (true) {
                    case item instanceof Player:
                        item.render(this.collidingElements);
                        break;
                    default:
                        item.render();
                        break;
                }
            }
        }

        this.camera.setCameraPosition(this.player.position, 10);

        this.skyMesh.position.set(this.camera.position.x, 0, 0);
        // (this.skyMesh.material as any).setSunAngle(70);
        // (this.skyMesh.material as any).render();
        skyShaderMat.setSunAngle(70);
        skyShaderMat.render();
        // skyShaderMat.render(this.clock);
        (this.scene.fog as IFog).color.copy(skyShaderMat.getFogColor());
        // // this.fogColor = (this.skyMesh.material as SkyShader).getFogColor();
        skyShaderMat.setTimeOfDay(0.6, [20, 55], 0, [195, 230], 0);
        const lightInfo = skyShaderMat.getLightInfo(this.camera.position);

        this.dirLight.position.copy(lightInfo.position);
        this.dirLight.intensity = lightInfo.intensity;
        this.dirLight.color.copy(lightInfo.color);
        this.dirLight.target.position.set(this.camera.position.x, 0, 0);
    }
}
