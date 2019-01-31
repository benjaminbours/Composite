import * as THREE from "three";
import { Mesh, IFog, Clock, DirectionalLight, Object3D } from "three";
// import SkyShader from "./SkyShader";
import Inputs from "./Inputs";
import Player from "./Player";
import CustomCamera from "./CustomCamera";

export default class App {
    private scene = new THREE.Scene();
    private camera = new CustomCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    private renderer: THREE.WebGLRenderer;

    private player = new Player();
    // private skyMesh: Mesh;

    private clock = new Clock();
    private dirLight = new DirectionalLight(0xFFFFEE, 0.5);

    private floor: Mesh;

    constructor(canvasDom: HTMLCanvasElement) {
        // inputs
        Inputs.init();

        // render
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvasDom,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // dirlight
        this.dirLight.castShadow = true;
        this.dirLight.position.set(-2, 1, 2);
        this.dirLight.target = new THREE.Object3D();
        this.scene.add(this.dirLight.target);
        this.scene.add(this.dirLight);

        // hemisphere light
        const ambient = new THREE.HemisphereLight(0xFFFFFF, 0x000000, .1);
        this.scene.add(ambient);

        // // cube
        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const material = new THREE.MeshBasicMaterial({
        //     color: 0x00ff00,
        // });
        // this.cube = new THREE.Mesh(geometry, material);
        // this.scene.add(this.cube);

        this.scene.fog = new THREE.FogExp2(0xFFFFFF, 0.0006);

        // this.camera.position.z = 5;
        this.camera.position.z = 300;
        this.camera.position.y = 10;

        // sky
        // const skyShaterMat = new SkyShader(this.camera);
        // const skyBox = new THREE.IcosahedronGeometry(3000, 1);
        // this.skyMesh = new THREE.Mesh(skyBox, skyShaterMat);
        // this.scene.add(this.skyMesh);

        // floor
        this.floor = new THREE.Mesh(
            new THREE.CircleGeometry(10000, 10),
            new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide, specular: 0x000000, shininess: 0, transparent: true }),
        );
        this.floor.receiveShadow = true;
        this.floor.rotation.x = -Math.PI * .5;
        this.floor.position.x = 3.5;
        this.scene.add(this.floor);

        // player
        this.camera.playerPosition.x = this.player.position.x;
        this.camera.playerPosition.y = this.player.position.y;
        this.scene.add(this.player);
        console.log(this.scene);
    }

    public render = () => {
        // const skyShaderMat = (this.skyMesh.material as SkyShader);
        this.renderer.render(this.scene, this.camera);

        // update everything which need an update in the scene
        for (const item of this.scene.children as Object3D | Player[]) {
            if (item.hasOwnProperty("render")) {
                item.render();
            }
        }

        this.camera.setCameraPosition(this.player.position, 10);

        // this.cube.rotation.x += 0.01;
        // this.cube.rotation.y += 0.01;

        // this.skyMesh.position.set(this.camera.position.x, 0, 0);
        // skyShaderMat.setSunAngle(100);
        // skyShaderMat.render(this.clock);
        // (this.scene.fog as IFog).color = skyShaderMat.getFogColor();
        // // this.fogColor = (this.skyMesh.material as SkyShader).getFogColor();
        // skyShaderMat.setTimeOfDay(1, [20, 55], 0, [195, 230], 0);
        // const lightInfo = skyShaderMat.getLightInfo(this.camera.position);

        // this.dirLight.position.copy(lightInfo.position);
        // this.dirLight.intensity = lightInfo.intensity;
        // this.dirLight.color.copy(lightInfo.color);
        // this.dirLight.target.position.set(this.camera.position.x, 0, 0);
    }
}
