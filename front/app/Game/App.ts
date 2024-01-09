// vendors
import {
    Mesh,
    DirectionalLight,
    Scene,
    WebGLRenderer,
    HemisphereLight,
    WebGLRenderTarget,
    Object3D,
    Clock,
    FogExp2,
    PCFSoftShadowMap,
    IcosahedronGeometry,
    Fog,
    Vector2,
    Box3,
    Vector3,
    Box3Helper,
    Object3DEventMap,
} from 'three';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// our libs
import {
    GamePlayerInputPayload,
    GameState,
    FLOOR,
    Side,
    SocketEventType,
    applySingleInputToSimulation,
    PhysicSimulation,
    ElementName,
    Layer,
    PositionLevelState,
    LevelState,
    Context,
    MovableComponentState,
    ElementToBounce,
    ProjectionLevelState,
    GameStateUpdatePayload,
    isLevelWithBounces,
} from '@benjaminbours/composite-core';
// local
import InputsManager from './Player/InputsManager';
import { LightPlayer, Player } from './Player';
import CustomCamera from './CustomCamera';
import basicPostProdVS from './glsl/basic_postprod_vs.glsl';
import playerInsideFS from './glsl/playerInside_fs.glsl';
import mixPassFS from './glsl/mixPass_fs.glsl';
import volumetricLightBounceFS from './glsl/volumetricLightBounce_fs.glsl';
import volumetricLightPlayerFS from './glsl/volumetricLightPlayer_fs.glsl';
import LevelController from './levels/levels.controller';
import { DoorOpener } from './elements/DoorOpener';
import { ShadowPlayer } from './Player/ShadowPlayer';
import SkyShader from './SkyShader';
import { SocketController } from '../SocketController';
import { EndLevel } from './elements/EndLevel';
import { ProjectionLevelWithGraphic } from './levels/ProjectionLevelWithGraphic';
import { stateReconciliation } from './stateReconciliation';

const PREDICTION_DELAY = 8;

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
    private dirLight = new DirectionalLight(0xffffee, 1);

    private levelController: LevelController;

    private mainComposer!: EffectComposer;
    private playerInsideComposer!: EffectComposer;

    private occlusionComposers: EffectComposer[] = [];
    private volumetricLightPasses: ShaderPass[] = [];

    private playerOcclusionComposer!: EffectComposer;
    private playerVolumetricLightPass!: ShaderPass;

    private lastServerInputs: [
        GamePlayerInputPayload | undefined,
        GamePlayerInputPayload | undefined,
    ] = [undefined, undefined];
    // private gameStateHistory: GameState[] = [];
    private inputsHistory: GamePlayerInputPayload[] = [];
    // its a predicted state if we compare it to the last validated state
    private shouldReconciliateState = false;

    public getCurrentGameState = () => this.currentState;

    private lastInput: GamePlayerInputPayload | undefined;

    private physicSimulation = new PhysicSimulation();

    /**
     * It's in fact the prediction state
     */
    private currentState: GameState; // simulation present
    private displayState: GameState; // simulation present
    public serverGameState: GameState; // simulation validated by the server, present - RTT
    private predictionHistory: GameState[] = [];

    private collidingElements: Object3D<Object3DEventMap>[] = [];
    private playerHelper?: Box3;

    constructor(
        canvasDom: HTMLCanvasElement,
        initialGameState: GameState,
        private playersConfig: Side[],
        public socketController: SocketController,
        public inputsManager: InputsManager,
    ) {
        this.currentState = JSON.parse(JSON.stringify(initialGameState));
        this.displayState = JSON.parse(JSON.stringify(initialGameState));
        this.serverGameState = JSON.parse(JSON.stringify(initialGameState));
        // inputs

        // levels
        this.levelController = new LevelController(initialGameState.level.id);
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
        this.scene.updateMatrixWorld();
        this.setupPostProcessing();

        this.socketController.getCurrentGameState = this.getCurrentGameState;
        this.socketController.onGameStateUpdate = (
            data: GameStateUpdatePayload,
        ) => {
            // console.log('received update', data.gameState);
            this.shouldReconciliateState = true;
            this.serverGameState = data.gameState;
            this.lastServerInputs = data.lastInputs;
        };
        this.socketController.synchronizeGameTimeWithServer =
            this.synchronizeGameTimeWithServer;
    }

    public resize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    public gameTimeIsSynchronized = false;
    public synchronizeGameTimeWithServer = (gameTime: number) => {
        this.currentState.game_time = gameTime;
        this.gameTimeIsSynchronized = true;
    };

    setupScene = (playersConfig: Side[]) => {
        this.scene.add(FLOOR);
        this.collidingElements.push(FLOOR);

        // player
        playersConfig.forEach((side, index) => {
            const player = (() => {
                switch (side) {
                    case Side.LIGHT:
                        const lightPlayer = new LightPlayer(index === 0);
                        lightPlayer.mesh.layers.set(Layer.OCCLUSION_PLAYER);
                        return lightPlayer;
                    case Side.SHADOW:
                        const shadowPlayer = new ShadowPlayer(index === 0);
                        shadowPlayer.mesh.layers.set(Layer.PLAYER_INSIDE);
                        return shadowPlayer;
                }
            })();
            this.players.push(player);
            this.scene.add(player);
        });

        this.camera.setDefaultTarget(this.players[0].position);

        // camera
        this.camera.position.z = 500;
        this.camera.position.y = 10;

        this.scene.fog = new FogExp2(0xffffff, 0.001);
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
        this.dirLight.shadow.bias = -0.01;
        // this.dirLight.position.set(-2, 1, 2);
        // this.dirLight.position.copy(this.camera.position);
        this.dirLight.target = new Object3D();
        this.scene.add(this.dirLight.target);
        this.scene.add(this.dirLight);
        this.scene.add(ambient);
        // sky
        const skyShaderMat = new SkyShader(this.camera);
        const skyBox = new IcosahedronGeometry(10000, 1);
        this.skyMesh = new Mesh(skyBox, skyShaderMat);
        this.skyMesh.rotation.set(0, 1, 0);
        this.scene.add(this.skyMesh);

        this.levelController.loadLevel(
            this.levelController.currentLevel,
            this.scene,
            this.players,
        );
        this.collidingElements.push(
            ...this.levelController.levels[this.levelController.currentLevel]!
                .collidingElements,
        );
        if (process.env.NEXT_PUBLIC_PLAYER_BBOX_HELPER) {
            this.playerHelper = new Box3();
            this.scene.add(new Box3Helper(this.playerHelper, 0xffff00));
        }
    };

    createRenderTarget = (renderScale: number) => {
        return new WebGLRenderTarget(
            this.width * renderScale,
            this.height * renderScale,
        );
    };

    createOcclusionComposer = (
        renderPass: RenderPass,
        lightPass: ShaderPass,
        occlusionRenderTarget: WebGLRenderTarget,
    ) => {
        const occlusionComposer = new EffectComposer(
            this.renderer,
            occlusionRenderTarget,
        );
        occlusionComposer.renderToScreen = false;
        occlusionComposer.addPass(renderPass);
        occlusionComposer.addPass(lightPass);

        return occlusionComposer;
    };

    createMixPass = (addTexture: WebGLRenderTarget) => {
        const mixPass = new ShaderPass(
            {
                uniforms: {
                    baseTexture: { value: null },
                    addTexture: { value: null },
                },
                vertexShader: basicPostProdVS,
                fragmentShader: mixPassFS,
            },
            'baseTexture',
        );
        mixPass.uniforms.addTexture.value = addTexture.texture;

        return mixPass;
    };

    setupPostProcessing = () => {
        const renderScale = 1;
        this.mainComposer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.mainComposer.addPass(renderPass);

        // create occlusion render for player light
        const occlusionRenderTarget = this.createRenderTarget(renderScale);
        this.playerVolumetricLightPass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
                lightPosition: { value: new Vector2(0.5, 0.5) },
                exposure: { value: 0.18 },
                decay: { value: 0.97 },
                density: { value: 0.8 },
                weight: { value: 0.5 },
                samples: { value: 100 },
            },
            vertexShader: basicPostProdVS,
            fragmentShader: volumetricLightPlayerFS,
        });
        this.playerVolumetricLightPass.needsSwap = false;
        this.playerOcclusionComposer = this.createOcclusionComposer(
            renderPass,
            this.playerVolumetricLightPass,
            occlusionRenderTarget,
        );
        const mixPass = this.createMixPass(occlusionRenderTarget);

        this.mainComposer.addPass(mixPass);

        // create occlusion render for each light bounce element
        const lightBounces =
            (
                this.levelController.levels[
                    this.levelController.currentLevel
                ] as any
            ).lightBounces || [];

        for (let i = 0; i < lightBounces.length; i++) {
            const occlusionRenderTarget = this.createRenderTarget(renderScale);
            const volumetricLightPass = new ShaderPass({
                uniforms: {
                    tDiffuse: { value: null },
                    lightPosition: { value: new Vector2(0.5, 0.5) },
                    exposure: { value: 0.18 },
                    decay: { value: 0.9 },
                    density: { value: 0.5 },
                    weight: { value: 0.5 },
                    samples: { value: 100 },
                },
                vertexShader: basicPostProdVS,
                fragmentShader: volumetricLightBounceFS,
            });
            volumetricLightPass.needsSwap = false;
            const occlusionComposer = this.createOcclusionComposer(
                renderPass,
                volumetricLightPass,
                occlusionRenderTarget,
            );
            const mixPass = this.createMixPass(occlusionRenderTarget);

            this.mainComposer.addPass(mixPass);
            this.occlusionComposers.push(occlusionComposer);
            this.volumetricLightPasses.push(volumetricLightPass);
        }

        // create a renderer for when a player is inside an element
        const playerInsideRenderTarget = this.createRenderTarget(renderScale);
        const playerInsidePass = new ShaderPass({
            uniforms: {
                tDiffuse: { value: null },
            },
            vertexShader: basicPostProdVS,
            fragmentShader: playerInsideFS,
        });
        playerInsidePass.needsSwap = false;
        this.playerInsideComposer = new EffectComposer(
            this.renderer,
            playerInsideRenderTarget,
        );
        this.playerInsideComposer.renderToScreen = false;
        this.playerInsideComposer.addPass(renderPass);
        this.playerInsideComposer.addPass(playerInsidePass);
        const playerInsideMixPass = this.createMixPass(
            playerInsideRenderTarget,
        );
        this.mainComposer.addPass(playerInsideMixPass);
    };

    public updateChildren = (object: Object3D) => {
        for (let i = 0; i < object.children.length; i++) {
            const item = object.children[i] as any;
            if (item.update) {
                if (
                    item instanceof DoorOpener ||
                    item instanceof EndLevel ||
                    item instanceof Player ||
                    item instanceof ElementToBounce
                ) {
                    // do nothing
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
        const payload = {
            player: this.playersConfig[0],
            inputs: { ...this.inputsManager.inputsActive },
            time: Date.now(),
            sequence: this.currentState.game_time,
        };
        const isInputRelease =
            this.lastInput &&
            ((this.lastInput.inputs.left &&
                !this.inputsManager.inputsActive.left) ||
                (this.lastInput.inputs.right &&
                    !this.inputsManager.inputsActive.right) ||
                (this.lastInput.inputs.jump &&
                    !this.inputsManager.inputsActive.jump));
        if (
            this.inputsManager.inputsActive.left ||
            this.inputsManager.inputsActive.right ||
            this.inputsManager.inputsActive.jump ||
            isInputRelease
        ) {
            this.inputsHistory.push(payload);
            // emit input to server
            this.socketController?.emit([
                SocketEventType.GAME_PLAYER_INPUT,
                payload,
            ]);
        }
        this.lastInput = payload;
    };

    public run = () => {
        this.delta = this.clock.getDelta();
        if (this.shouldReconciliateState) {
            this.shouldReconciliateState = false;
            // keep only the inputs that are not validated yet
            this.inputsHistory = this.inputsHistory.filter(
                ({ sequence }) =>
                    sequence >= this.serverGameState.lastValidatedInput,
            );
            this.predictionHistory = stateReconciliation(
                JSON.parse(JSON.stringify(this.inputsHistory)),
                this.currentState.game_time,
                this.serverGameState,
                this.playersConfig[0],
                JSON.parse(JSON.stringify(this.lastServerInputs)),
                this.collidingElements,
                this.physicSimulation.delta,
            );
            if (this.predictionHistory[this.predictionHistory.length - 1]) {
                this.currentState = {
                    ...this.predictionHistory[
                        this.predictionHistory.length - 1
                    ],
                    // this line avoid memory issues when switching tabs
                    game_time: this.currentState.game_time,
                };
            }
        }
        this.physicSimulation.run((delta) => {
            this.processInputs();
            // predict first player
            applySingleInputToSimulation(
                delta,
                this.playersConfig[0],
                this.inputsManager.inputsActive,
                this.collidingElements,
                this.currentState,
                Context.client,
                Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
            );
            // predict second player
            const otherPlayerPredictedInput = this.lastServerInputs[
                this.playersConfig[1]
            ]?.inputs || {
                jump: false,
                left: false,
                right: false,
                top: false,
                bottom: false,
            };
            applySingleInputToSimulation(
                delta,
                this.playersConfig[1],
                otherPlayerPredictedInput,
                this.collidingElements,
                this.currentState,
                Context.client,
                Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
            );
            this.currentState.game_time++;
            if (this.gameTimeIsSynchronized) {
                this.predictionHistory.push(
                    JSON.parse(JSON.stringify(this.currentState)),
                );
            }
            // END PREDICTION
            // START DISPLAY TIME
            // this.displayState = this.currentState;
            this.displayState =
                this.predictionHistory.find(
                    (state) =>
                        state.game_time ===
                        this.currentState.game_time - PREDICTION_DELAY,
                ) ||
                (() => {
                    console.log('no state found');
                    return this.displayState;
                })();

            for (let i = 0; i < this.playersConfig.length; i++) {
                const side = this.playersConfig[i];
                const playerPosition = this.displayState.players[side].position;
                this.players[i].position.set(
                    playerPosition.x,
                    playerPosition.y,
                    0,
                );
            }
            this.updateWorldPhysic(this.displayState);
            if (this.playerHelper) {
                this.playerHelper.setFromCenterAndSize(
                    this.players[0].position,
                    new Vector3(40, 40),
                );
            }
            this.updatePlayerGraphics(this.displayState);
        });
        this.updateWorldGraphics();
    };

    public updatePlayerGraphics = (state: GameState) => {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];

            if (player instanceof LightPlayer) {
                this.playerVolumetricLightPass.material.uniforms.lightPosition.value =
                    player.get2dLightPosition(
                        this.camera,
                        state.players[this.playersConfig[0]].velocity,
                    );
            }

            if (player instanceof ShadowPlayer) {
                player.update(this.delta);
            }
        }
    };

    private updateWorldPhysic = (state: GameState) => {
        // TODO: Remove code duplication, function is copy pasted from apply world update
        const isPositionLevel = (
            value: LevelState,
        ): value is PositionLevelState =>
            Boolean((value as PositionLevelState).doors);

        // doors
        if (isPositionLevel(state.level)) {
            for (const key in state.level.doors) {
                const activators = state.level.doors[key];

                const doorOpener = this.collidingElements
                    .find(
                        (object) =>
                            object.name === ElementName.AREA_DOOR_OPENER(key),
                    )
                    ?.children.find(
                        (object) =>
                            object.name === ElementName.DOOR_OPENER(key),
                    ) as DoorOpener | undefined;

                if (doorOpener) {
                    if (activators.length > 0 && !doorOpener.shouldActivate) {
                        doorOpener.shouldActivate = true;
                    } else if (
                        activators.length === 0 &&
                        doorOpener.shouldActivate
                    ) {
                        doorOpener.shouldActivate = false;
                    }
                }

                const withFocusCamera = activators.includes(
                    this.playersConfig[0],
                );
                doorOpener?.update(this.delta, this.camera, withFocusCamera);
            }
        }

        if (isLevelWithBounces(state.level)) {
            (
                this.levelController.levels[
                    this.levelController.currentLevel
                ] as ProjectionLevelWithGraphic
            ).bounces.forEach((bounce) => {
                const rotationY = (state.level as ProjectionLevelState).bounces[
                    bounce.bounceID
                ].rotationY;
                bounce.update(rotationY);
            });
        }

        // end level
        const endLevelElement = this.collidingElements
            .find((object) => object.name === ElementName.AREA_END_LEVEL)
            ?.children.find(
                (object) => object.name === ElementName.END_LEVEL,
            ) as EndLevel | undefined;

        if (endLevelElement) {
            if (
                state.level.end_level.includes(Side.LIGHT) &&
                !endLevelElement.shouldActivateLight
            ) {
                endLevelElement.shouldActivateLight = true;
            }

            if (
                !state.level.end_level.includes(Side.LIGHT) &&
                endLevelElement.shouldActivateLight
            ) {
                endLevelElement.shouldActivateLight = false;
            }

            if (
                state.level.end_level.includes(Side.SHADOW) &&
                !endLevelElement.shouldActivateShadow
            ) {
                endLevelElement.shouldActivateShadow = true;
            }

            if (
                !state.level.end_level.includes(Side.SHADOW) &&
                endLevelElement.shouldActivateShadow
            ) {
                endLevelElement.shouldActivateShadow = false;
            }

            endLevelElement.update(this.delta);
        }
    };

    public updateWorldGraphics = () => {
        this.updateChildren(this.scene);
        // update the floor to follow the player to be infinite
        // this.floor.position.set(this.players[0].position.x, 0, 0);

        // sky
        const skyShaderMat = this.skyMesh.material as SkyShader;
        this.skyMesh.position.set(this.camera.position.x, 0, 0);
        skyShaderMat.setSunAngle(200);
        skyShaderMat.render();
        (this.scene.fog as Fog).color.copy(skyShaderMat.getFogColor());
        skyShaderMat.setTimeOfDay(0.6, [255, 255], 0, [195, 230], 0);
        // skyShaderMat.setTimeOfDay(1,[20,55], 0, [195,230], 0);
        const lightInfo = skyShaderMat.getLightInfo(this.camera.position);

        this.dirLight.position.copy(lightInfo.position);
        this.dirLight.intensity = lightInfo.intensity;
        this.dirLight.color.copy(lightInfo.color);
        this.dirLight.target.position.set(this.camera.position.x, 0, 0);

        // update camera
        this.camera.update();
    };

    public render = () => {
        this.camera.layers.set(Layer.OCCLUSION_PLAYER);
        this.renderer.setClearColor(0x000000);
        this.playerOcclusionComposer.render();
        // one occlusion composer by bounce
        this.camera.layers.set(Layer.OCCLUSION);
        for (let i = 0; i < this.occlusionComposers.length; i++) {
            if (i > 0) {
                const previousLightBounce = (
                    this.levelController.levels[
                        this.levelController.currentLevel
                    ] as any
                ).lightBounces[i - 1];
                previousLightBounce.layers.disable(Layer.OCCLUSION);
            }
            const lightBounce = (
                this.levelController.levels[
                    this.levelController.currentLevel
                ] as any
            ).lightBounces[i];
            lightBounce.layers.enable(Layer.OCCLUSION);
            this.volumetricLightPasses[
                i
            ].material.uniforms.lightPosition.value = lightBounce.get2dPosition(
                this.camera,
            );
            const occlusionComposer = this.occlusionComposers[i];
            occlusionComposer.render();
            if (i === this.occlusionComposers.length - 1) {
                lightBounce.layers.disable(Layer.OCCLUSION);
            }
        }

        // player inside
        if (
            this.displayState.players[this.playersConfig[0]].state ===
                MovableComponentState.inside ||
            this.displayState.players[this.playersConfig[1]].state ===
                MovableComponentState.inside
        ) {
            if (
                this.displayState.players[this.playersConfig[0]].state ===
                MovableComponentState.inside
            ) {
                (this.players[0] as any).mesh.layers.enable(
                    Layer.PLAYER_INSIDE,
                );
            } else {
                (this.players[0] as any).mesh.layers.disable(
                    Layer.PLAYER_INSIDE,
                );
            }

            if (
                this.displayState.players[this.playersConfig[1]].state ===
                MovableComponentState.inside
            ) {
                (this.players[1] as any).mesh.layers.enable(
                    Layer.PLAYER_INSIDE,
                );
            } else {
                (this.players[1] as any).mesh.layers.disable(
                    Layer.PLAYER_INSIDE,
                );
            }
            this.camera.layers.set(Layer.PLAYER_INSIDE);
            this.renderer.setClearColor(0x444444);
            this.playerInsideComposer.render();
        } else {
            this.renderer.setRenderTarget(
                this.playerInsideComposer.renderTarget1,
            );
            this.renderer.clear();
        }
        this.camera.layers.set(Layer.DEFAULT);
        this.renderer.setClearColor(0x000000);
        this.mainComposer.render();
    };
}
