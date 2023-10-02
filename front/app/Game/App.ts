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
    Vector2,
} from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// our libs
import {
    GamePlayerInputPayload,
    GameState,
    Levels,
    Side,
    SocketEventType,
    applyInputsUntilTarget,
    updateGameState,
} from '@benjaminbours/composite-core';
// local
// import SkyShader from './SkyShader';
import InputsManager from './Player/InputsManager';
import { LightPlayer, Player } from './Player';
import CustomCamera from './CustomCamera';
import { CollidingElem } from './types';
import { mixShader, volumetricLightShader } from './volumetricLightShader';
import { Layer } from './constants';
import LevelController from './levels/levels.controller';
import { DoorOpener } from './elements/DoorOpener';
import { ShadowPlayer } from './Player/ShadowPlayer';
import SkyShader from './SkyShader';
import { SocketController } from '../SocketController';

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

    private volumetricLightPass!: ShaderPass;
    private occlusionComposer!: EffectComposer;
    private mainComposer!: EffectComposer;

    public inputsManager: InputsManager;

    private inputsHistory: GamePlayerInputPayload[] = [];
    // its a predicted state if we compare it to the last validated state
    private currentState: GameState;

    private lastInput: GamePlayerInputPayload | undefined;

    private serverGameStateHistory: GameState[] = [];
    private shouldInterpolate = false;
    private interpolationRatio = 0;
    private localStateAtInterpolationStart: GameState;
    private targetStateAtInterpolationStart: GameState;

    constructor(
        canvasDom: HTMLCanvasElement,
        currentLevel: Levels,
        private playersConfig: Side[],
        private socketController: SocketController,
    ) {
        // TODO: Make the server send the initial state
        const initialState = new GameState(
            currentLevel,
            10,
            20,
            0,
            0,
            200,
            20,
            0,
            0,
            Date.now(),
        );
        this.currentState = initialState;
        this.localStateAtInterpolationStart = { ...initialState };
        this.targetStateAtInterpolationStart = { ...initialState };
        // inputs

        this.inputsManager = new InputsManager();

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
        this.floor.name = 'floor';
        this.floor.castShadow = false;
        this.floor.receiveShadow = true;
        this.floor.rotation.x = -Math.PI / 2;

        this.scene.add(this.floor);

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

        this.socketController.onGameStateUpdate = (gameState: GameState) => {
            this.interpolationRatio = 0;
            this.shouldInterpolate = true;
            this.inputsHistory = this.inputsHistory.filter(
                ({ time }) => time > gameState.lastValidatedInput,
            );
            this.serverGameStateHistory.push(gameState);
        };
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

    private processInputs = () => {
        const time = Date.now();
        const payload = {
            player: this.playersConfig[0],
            inputs: { ...this.inputsManager.inputsActive },
            delta: this.delta,
            time,
        };
        if (
            this.inputsManager.inputsActive.left ||
            this.inputsManager.inputsActive.right ||
            this.inputsManager.inputsActive.left
        ) {
            this.inputsHistory.push(payload);
            // emit input to server
            this.socketController?.emit([
                SocketEventType.GAME_PLAYER_INPUT,
                payload,
            ]);
        }

        if (this.lastInput) {
            if (
                (this.lastInput.inputs.left &&
                    !this.inputsManager.inputsActive.left) ||
                (this.lastInput.inputs.right &&
                    !this.inputsManager.inputsActive.right)
            ) {
                // console.log('emit inputs released');
                this.socketController?.emit([
                    SocketEventType.GAME_PLAYER_INPUT,
                    payload,
                ]);
            }
        }
        this.lastInput = payload;
    };

    private interpolateWithServerUpdate = () => {
        const serverGameState =
            this.serverGameStateHistory[this.serverGameStateHistory.length - 1];

        this.localStateAtInterpolationStart = { ...this.currentState };
        const nextStateAtInterpolationTime = { ...serverGameState };
        const playerKey =
            this.playersConfig[0] === Side.LIGHT ? 'light' : 'shadow';
        applyInputsUntilTarget(
            {
                [playerKey]: this.lastInput,
            },
            this.inputsHistory,
            [
                this.floor,
                ...this.levelController.levels[
                    this.levelController.currentLevel
                ]!.collidingElements,
            ],
            nextStateAtInterpolationTime,
            Date.now(),
        );
        // console.log(
        //     `next state computed ${playerKey}`,
        //     nextStateAtInterpolationTime[`${playerKey}_x`],
        //     nextStateAtInterpolationTime[`${playerKey}_velocity_x`],
        // );
        // console.log(
        //     'current state',
        //     this.currentState[`${playerKey}_x`],
        //     this.currentState[`${playerKey}_velocity_x`],
        // );
        this.targetStateAtInterpolationStart = {
            ...nextStateAtInterpolationTime,
        };

        // console.log('current state', this.currentState);
        // console.log('server corrected state', nextStateAtInterpolationTime);

        this.shouldUpdateInterpolation = true;
        // this.currentState = nextStateAtInterpolationTime;
    };

    private shouldUpdateInterpolation = false;

    public updateInterpolation = () => {
        if (this.interpolationRatio >= 1) {
            this.shouldUpdateInterpolation = false;
            return;
        }
        this.interpolationRatio += this.delta;
        // console.log('interpolate');
        // console.log(this.interpolationRatio);

        const properties = ['position', 'velocity'];
        for (let i = 0; i < this.playersConfig.length; i++) {
            const player = this.playersConfig[i];
            const playerKey = player === Side.LIGHT ? 'light' : 'shadow';

            for (let j = 0; j < properties.length; j++) {
                const property = properties[j];
                const key =
                    property === 'position'
                        ? `${playerKey}`
                        : `${playerKey}_velocity`;
                const vector = new Vector2(
                    (this.localStateAtInterpolationStart as any)[`${key}_x`],
                    (this.localStateAtInterpolationStart as any)[`${key}_y`],
                );
                const vectorTarget = new Vector2(
                    (this.targetStateAtInterpolationStart as any)[`${key}_x`],
                    (this.targetStateAtInterpolationStart as any)[`${key}_y`],
                );
                const targetNormalize = vectorTarget
                    .clone()
                    .sub(vector)
                    .normalize();
                const distance =
                    vector.distanceTo(vectorTarget) * this.interpolationRatio;

                const displacement = targetNormalize.multiplyScalar(distance);
                // if (i === 0) {
                //     console.log('origin', vector);
                //     console.log('target', vectorTarget);
                //     console.log('distance', distance);
                //     console.log('displacement', displacement);
                // }
                // vector.add(targetNormalize.multiplyScalar(distance));
                (this.currentState as any)[`${key}_x`] += displacement.x;
                (this.currentState as any)[`${key}_y`] += displacement.y;
            }
        }
    };

    public update = () => {
        this.delta = this.clock.getDelta();
        if (this.shouldInterpolate) {
            this.interpolateWithServerUpdate();
            this.shouldInterpolate = false;
        }
        if (this.shouldUpdateInterpolation) {
            this.updateInterpolation();
        }
        this.processInputs();
        updateGameState(
            this.delta,
            this.playersConfig[0],
            this.inputsManager.inputsActive,
            [
                this.floor,
                ...this.levelController.levels[
                    this.levelController.currentLevel
                ]!.collidingElements,
            ],
            this.currentState,
        );

        const playerKey =
            this.playersConfig[0] === Side.LIGHT ? 'light' : 'shadow';
        const otherPlayerKey =
            this.playersConfig[0] === Side.LIGHT ? 'shadow' : 'light';

        this.players[0].position.set(
            this.currentState[`${playerKey}_x`],
            this.currentState[`${playerKey}_y`],
            0,
        );

        this.players[1].position.set(
            this.currentState[`${otherPlayerKey}_x`],
            this.currentState[`${otherPlayerKey}_y`],
            0,
        );

        // update everything which need an update in the scene
        this.updateChildren(this.scene);
        // update the floor to follow the player to be infinite
        // this.floor.position.set(this.players[0].position.x, 0, 0);

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
