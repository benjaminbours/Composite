import {
    Mesh,
    // Fog,
    // Clock,
    // DirectionalLight,
    // Object3D,
    // Group,
    Scene,
    WebGLRenderer,
    // PCFSoftShadowMap,
    // HemisphereLight,
    // FogExp2,
    // IcosahedronGeometry,
    MeshPhongMaterial,
    CircleGeometry,
    WebGLRenderTarget,
    Object3D,
    // AmbientLight,
} from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import SkyShader from './SkyShader';
import Inputs from './Player/Inputs';
import { LightPlayer, Player } from './Player';
import CustomCamera from './CustomCamera';
import { CollidingElem } from './types';
import { Side } from '../types';
import { mixShader, volumetricLightShader } from './volumetricLightShader';
import { Layer } from './constants';
import LevelController from './levels/levels.controller';
import { collisionSystem, updateDelta } from './Player/physics/movementHelpers';
import { DoorOpener } from './elements/DoorOpener';

export default class App {
    private width = window.innerWidth;
    private height = window.innerHeight;

    private scene = new Scene();
    private camera = new CustomCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        12000,
    );
    private renderer: WebGLRenderer;

    private players: Player[] = [];
    // private skyMesh: Mesh;

    // private clock = new Clock();
    // private dirLight = new DirectionalLight(0xffffee, 0.5);

    private floor!: Mesh;

    private levelController = new LevelController();
    private collidingElements: CollidingElem[] = [];
    // private interactElements: InteractElem[] = [];

    private volumetricLightPass!: ShaderPass;
    private occlusionComposer!: EffectComposer;
    private mainComposer!: EffectComposer;

    constructor(canvasDom: HTMLCanvasElement, playersConfig: Side[]) {
        // inputs
        Inputs.init();

        // render
        this.renderer = new WebGLRenderer({
            canvas: canvasDom,
            // powerPreference: "high-performance",
            // precision: "highp",
            // antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = PCFSoftShadowMap;
        // this.renderer.gammaInput = true;
        // this.renderer.gammaOutput = true;

        // // dirlight
        // this.dirLight.castShadow = true;
        // this.dirLight.position.set(-2, 1, 2);
        // this.dirLight.target = new Object3D();
        // this.scene.add(this.dirLight.target);
        // this.scene.add(this.dirLight);

        // hemisphere light

        // this.scene.fog = new FogExp2(0xffffff, 0.0006);
        // const ambient = new HemisphereLight(0xffffff, 0x000000, 0.1);
        // this.scene.add(ambient);

        // sky
        // const skyShaterMat = new SkyShader(this.camera);
        // const skyBox = new IcosahedronGeometry(3000, 1);
        // this.skyMesh = new Mesh(skyBox, skyShaterMat);
        // this.skyMesh.rotation.set(0, 1, 0);
        // this.scene.add(this.skyMesh);

        this.setupScene(playersConfig);
        this.setupPostProcessing();
    }

    setupScene = (playersConfig: Side[]) => {
        // floor
        this.floor = new Mesh(
            new CircleGeometry(10000, 10),
            new MeshPhongMaterial({
                // color: 0x000000,
                // side: DoubleSide,
                // specular: 0x000000,
                shininess: 0,
                // transparent: true,
            }),
        );
        this.floor.receiveShadow = true;
        this.floor.rotation.x = -Math.PI * 0.5;
        this.floor.position.x = 3.5;

        this.scene.add(this.floor);
        this.collidingElements.push(this.floor);

        // // player
        playersConfig.forEach((side) => {
            const player = (() => {
                switch (side) {
                    case 'white':
                        return new LightPlayer();
                    case 'black':
                        return new Player();
                }
            })();
            this.players.push(player);
            this.scene.add(player);
            player.mesh.layers.set(Layer.OCCLUSION);
        });

        this.camera.setDefaultTarget(this.players[0].position);

        // const ambient = new AmbientLight();
        // this.scene.add(ambient);

        // camera
        this.camera.position.z = 300;
        this.camera.position.y = 10;

        this.levelController.loadLevel(
            'positionLevel',
            this.scene,
            this.players,
        );
    };

    setupPostProcessing = () => {
        const renderScale = 1;
        const occlusionRenderTarget = new WebGLRenderTarget(
            this.width * renderScale,
            this.height * renderScale,
        );
        const renderPass = new RenderPass(this.scene, this.camera);
        this.volumetricLightPass = new ShaderPass(volumetricLightShader);
        this.volumetricLightPass.needsSwap = false;

        this.occlusionComposer = new EffectComposer(
            this.renderer,
            occlusionRenderTarget,
        );
        this.occlusionComposer.renderToScreen = false;
        this.occlusionComposer.addPass(renderPass);
        this.occlusionComposer.addPass(this.volumetricLightPass);

        const mixPass = new ShaderPass(mixShader, 'baseTexture');
        mixPass.uniforms.addTexture.value = occlusionRenderTarget.texture;

        this.mainComposer = new EffectComposer(this.renderer);
        this.mainComposer.addPass(renderPass);
        this.mainComposer.addPass(mixPass);
    };

    public updateChildren = (object: Object3D) => {
        for (let i = 0; i < object.children.length; i++) {
            const item = object.children[i] as any;
            if (item.hasOwnProperty('update')) {
                if (item instanceof DoorOpener) {
                    item.update(this.camera);
                } else {
                    item.update();
                }
            }
            if (item.children?.length) {
                this.updateChildren(item);
            }
        }
    };

    public update = () => {
        // TODO: Multiple clocks are used in various places (movement helper, mysticPlace)
        // Lets use just one store in the app
        updateDelta();
        // update everything which need an update in the scene
        const currentLevelCollidingElements =
            this.levelController.levels[this.levelController.currentLevel!]
                .collidingElements;
        collisionSystem(this.players, [
            ...this.collidingElements,
            ...currentLevelCollidingElements,
        ]);
        this.updateChildren(this.scene);
        // update the floor to follow the player to be infinite
        this.floor.position.set(this.players[0].position.x, 0, 0);

        this.volumetricLightPass.material.uniforms.lightPosition.value = (
            this.players[0] as LightPlayer
        ).get2dLightPosition(this.camera);

        // update camera
        this.camera.update(10);
    };

    public render = () => {
        this.camera.layers.set(Layer.OCCLUSION);
        this.renderer.setClearColor(0x000000);
        this.occlusionComposer.render();
        this.camera.layers.set(Layer.DEFAULT);
        this.renderer.setClearColor(0x090611);
        this.mainComposer.render();
        // const skyShaderMat = this.skyMesh.material as SkyShader;

        // this.effectAdditiveBlending.uniforms.tAdd.value =
        //     this.occlusionRenderTarget.texture;
        // console.log(this.occlusionRenderTarget.texture.version);

        // this.renderer.render(this.scene, this.camera);

        // this.skyMesh.position.set(this.camera.position.x, 0, 0);
        // // (this.skyMesh.material as any).setSunAngle(70);
        // // (this.skyMesh.material as any).render();
        // skyShaderMat.setSunAngle(70);
        // skyShaderMat.render();
        // // skyShaderMat.render(this.clock);
        // (this.scene.fog as Fog).color.copy(skyShaderMat.getFogColor());
        // // // this.fogColor = (this.skyMesh.material as SkyShader).getFogColor();
        // skyShaderMat.setTimeOfDay(0.6, [20, 55], 0, [195, 230], 0);
        // const lightInfo = skyShaderMat.getLightInfo(this.camera.position);

        // this.dirLight.position.copy(lightInfo.position);
        // this.dirLight.intensity = lightInfo.intensity;
        // this.dirLight.color.copy(lightInfo.color);
        // this.dirLight.target.position.set(this.camera.position.x, 0, 0);
    };
}
