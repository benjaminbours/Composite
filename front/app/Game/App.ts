// vendors
import {
    Mesh,
    DirectionalLight,
    Scene,
    WebGLRenderer,
    HemisphereLight,
    MeshPhongMaterial,
    CircleGeometry,
    WebGLRenderTarget,
    Object3D,
    Clock,
    FogExp2,
    PCFSoftShadowMap,
    IcosahedronGeometry,
    Fog,
} from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// our libs
import { Levels, Side, SocketEventType } from '@benjaminbours/composite-core';
// local
// import SkyShader from './SkyShader';
import Inputs from './Player/Inputs';
import { LightPlayer, Player } from './Player';
import CustomCamera from './CustomCamera';
import { CollidingElem } from './types';
import { mixShader, volumetricLightShader } from './volumetricLightShader';
import { Layer } from './constants';
import LevelController from './levels/levels.controller';
import { collisionSystem } from './Player/physics/collision.system';
import { DoorOpener } from './elements/DoorOpener';
import { ShadowPlayer } from './Player/ShadowPlayer';
import SkyShader from './SkyShader';
import { SocketController } from '../SocketController';

function throttle(fn: (args: any[]) => any, wait: number) {
    let shouldWait = false;
    return function () {
        if (!shouldWait) {
            fn([arguments]);
            shouldWait = true;
            setTimeout(() => (shouldWait = false), wait);
        }
    };
}

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
    private skyMesh!: Mesh;

    public clock = new Clock();
    private delta = this.clock.getDelta();
    private dirLight = new DirectionalLight(0xffffee, 0.5);

    private floor!: Mesh;

    private levelController: LevelController;
    private collidingElements: CollidingElem[] = [];
    // private interactElements: InteractElem[] = [];

    private volumetricLightPass!: ShaderPass;
    private occlusionComposer!: EffectComposer;
    private mainComposer!: EffectComposer;

    constructor(
        canvasDom: HTMLCanvasElement,
        currentLevel: Levels,
        playersConfig: Side[],
        private socketController?: SocketController,
    ) {
        // inputs
        Inputs.init();

        // levels
        this.levelController = new LevelController(currentLevel);
        // render
        this.renderer = new WebGLRenderer({
            canvas: canvasDom,
            // powerPreference: "high-performance",
            // precision: "highp",
            // antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;

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
        this.floor.castShadow = false;
        this.floor.receiveShadow = true;
        this.floor.rotation.x = -Math.PI * 0.5;
        this.floor.position.x = 3.5;

        this.scene.add(this.floor);
        this.collidingElements.push(this.floor);

        // player
        playersConfig.forEach((side, index) => {
            const player = (() => {
                switch (side) {
                    case Side.LIGHT:
                        const lightPlayer = new LightPlayer(index === 0);
                        lightPlayer.mesh.layers.set(Layer.OCCLUSION);
                        return lightPlayer;
                    case Side.SHADOW:
                        return new ShadowPlayer(index === 0);
                }
            })();
            this.players.push(player);
            this.scene.add(player);
        });
        if (this.socketController) {
            this.socketController.secondPlayer = this.players[1];
        }

        this.camera.setDefaultTarget(this.players[0].position);

        // camera
        this.camera.position.z = 300;
        this.camera.position.y = 10;

        this.scene.fog = new FogExp2(0xffffff, 0.0006);
        const ambient = new HemisphereLight(0xffffff, 0x000000, 0.1);

        // dirlight
        this.dirLight.castShadow = true;
        this.dirLight.shadow.camera.top = 1000;
        this.dirLight.shadow.camera.bottom = -1000;
        this.dirLight.shadow.camera.left = 800;
        this.dirLight.shadow.camera.right = -800;
        this.dirLight.shadow.camera.near = 1500;
        this.dirLight.shadow.camera.far = 8000;
        this.dirLight.shadow.mapSize.width = 1024 * 2;
        this.dirLight.shadow.mapSize.height = 1024 * 2;
        this.dirLight.position.copy(this.camera.position);
        this.dirLight.target = new Object3D();
        this.scene.add(this.dirLight.target);
        this.scene.add(this.dirLight);
        this.scene.add(ambient);
        // sky
        const skyShaterMat = new SkyShader(this.camera);
        const skyBox = new IcosahedronGeometry(10000, 1);
        this.skyMesh = new Mesh(skyBox, skyShaterMat);
        this.skyMesh.rotation.set(0, 1, 0);
        this.scene.add(this.skyMesh);

        this.levelController.loadLevel(
            this.levelController.currentLevel,
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
            if (item.update) {
                if (item instanceof DoorOpener) {
                    item.update(this.delta, this.camera);
                } else {
                    item.update(this.delta);
                }
            }
            if (item.children?.length) {
                this.updateChildren(item);
            }
        }
    };

    // TODO: This is not really optimized and will scale poorly.
    // A better approach would be to emit only user inputs
    // do a prediction on the client to keep fluidity, calculate an authoritative position on the server
    // then validate or correct the initial prediction made on the client.
    private emitPlayerPosition = throttle(() => {
        if (this.socketController) {
            this.socketController.emit([
                SocketEventType.GAME_POSITION,
                {
                    x: this.players[0].position.x,
                    y: this.players[0].position.y,
                },
            ]);
        }
    }, 25);

    public update = () => {
        this.delta = this.clock.getDelta();
        // update everything which need an update in the scene
        collisionSystem(this.players, [
            ...this.collidingElements,
            ...this.levelController.levels[this.levelController.currentLevel]!
                .collidingElements,
        ]);
        this.updateChildren(this.scene);
        // update the floor to follow the player to be infinite
        this.floor.position.set(this.players[0].position.x, 0, 0);
        this.emitPlayerPosition();

        const lightPlayer = this.players.find(
            (player) => player instanceof LightPlayer,
        );

        if (lightPlayer) {
            this.volumetricLightPass.material.uniforms.lightPosition.value = (
                lightPlayer as LightPlayer
            ).get2dLightPosition(this.camera);
        }

        // sky
        const skyShaderMat = this.skyMesh.material as SkyShader;
        this.skyMesh.position.set(this.camera.position.x, 0, 0);
        skyShaderMat.setSunAngle(210);
        skyShaderMat.render();
        (this.scene.fog as Fog).color.copy(skyShaderMat.getFogColor());
        skyShaderMat.setTimeOfDay(0.6, [20, 55], 0, [195, 230], 0);
        const lightInfo = skyShaderMat.getLightInfo(this.camera.position);

        this.dirLight.position.copy(lightInfo.position);
        this.dirLight.intensity = lightInfo.intensity;
        this.dirLight.color.copy(lightInfo.color);
        this.dirLight.target.position.set(this.camera.position.x, 0, 0);

        // update camera
        this.camera.update();
    };

    public render = () => {
        this.camera.layers.set(Layer.OCCLUSION);
        this.renderer.setClearColor(0x000000);
        this.occlusionComposer.render();
        this.camera.layers.set(Layer.DEFAULT);
        this.renderer.setClearColor(0x000000);
        this.mainComposer.render();

        // this.effectAdditiveBlending.uniforms.tAdd.value =
        //     this.occlusionRenderTarget.texture;
        // console.log(this.occlusionRenderTarget.texture.version);

        // this.renderer.render(this.scene, this.camera);
    };
}
