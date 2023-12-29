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
    Vec2,
    Box3,
    Vector3,
    Box3Helper,
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
    applySingleInput,
    PhysicLoop,
    applyInputList,
    ElementName,
    Layer,
    PositionLevelState,
    LevelState,
    Context,
    MovableComponentState,
    ElementToBounce,
    ProjectionLevelState,
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

interface InterpolationConfig {
    ratio: number;
    increment: number;
    shouldUpdate: boolean;
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
    private dirLight = new DirectionalLight(0xffffee, 1);

    private levelController: LevelController;

    private mainComposer!: EffectComposer;
    private playerInsideComposer!: EffectComposer;

    private occlusionComposers: EffectComposer[] = [];
    private volumetricLightPasses: ShaderPass[] = [];

    private playerOcclusionComposer!: EffectComposer;
    private playerVolumetricLightPass!: ShaderPass;

    public inputsManager: InputsManager;

    private lastInputValidated: GamePlayerInputPayload | undefined;
    // private gameStateHistory: GameState[] = [];
    private inputsHistory: GamePlayerInputPayload[] = [];
    // its a predicted state if we compare it to the last validated state
    private currentState: GameState;
    private shouldReconciliateState = false;

    getCurrentGameState = () => this.currentState;

    private lastInput: GamePlayerInputPayload | undefined;

    private physicLoop = new PhysicLoop();
    public serverGameState: GameState;
    // used only for other players
    private interpolation: InterpolationConfig = {
        ratio: 0,
        increment: 10,
        shouldUpdate: false,
    };

    private playerHelper?: Box3;

    constructor(
        canvasDom: HTMLCanvasElement,
        initialGameState: GameState,
        private playersConfig: Side[],
        public socketController: SocketController,
    ) {
        this.currentState = JSON.parse(JSON.stringify(initialGameState));
        this.serverGameState = JSON.parse(JSON.stringify(initialGameState));
        // this.gameStateHistory.push(
        //     JSON.parse(JSON.stringify(initialGameState)),
        // );
        // inputs

        this.inputsManager = new InputsManager();

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
        this.socketController.onGameStateUpdate = (gameState: GameState) => {
            // console.log('received update', gameState);
            // const gameTimeDelta =
            //     this.currentState.game_time - gameState.game_time;
            // console.log('time local', this.currentState.game_time);
            // console.log('time server', gameState.game_time);
            // console.log('time delta', gameTimeDelta);
            this.shouldReconciliateState = true;
            this.serverGameState = gameState;
            // this.checkServerState();
        };
        this.socketController.synchronizeGameTimeWithServer =
            this.synchronizeGameTimeWithServer;
    }

    public resize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    public synchronizeGameTimeWithServer = (gameTime: number) => {
        this.currentState.game_time = gameTime;
    };

    setupScene = (playersConfig: Side[]) => {
        this.scene.add(FLOOR);

        // player
        playersConfig.forEach((side, index) => {
            const player = (() => {
                switch (side) {
                    case Side.LIGHT:
                        const lightPlayer = new LightPlayer(index === 0);
                        lightPlayer.mesh.layers.set(Layer.OCCLUSION_PLAYER);
                        lightPlayer.mesh.layers.enable(Layer.PLAYER_INSIDE);
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
        this.camera.position.z = 350;
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
                    item instanceof Player
                ) {
                    // do nothing
                } else if (item instanceof ElementToBounce) {
                    const rotationY =
                        (this.currentState.level as ProjectionLevelState)
                            .bounces[item.bounceID]?.rotationY || 0;
                    item.update(rotationY);
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
        const time = this.currentState.game_time;
        const payload = {
            player: this.playersConfig[0],
            inputs: { ...this.inputsManager.inputsActive },
            time: Date.now(),
            sequence: time,
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

    private reconciliateState = () => {
        // TODO: Can be optimized
        this.lastInputValidated = (() => {
            const input = this.inputsHistory.findLast(
                (input) =>
                    input.sequence <= this.serverGameState.lastValidatedInput,
            );
            if (input) {
                return JSON.parse(JSON.stringify(input));
            }
            return this.lastInputValidated;
        })();
        // console.log(JSON.parse(JSON.stringify(this.inputsHistory)));

        this.inputsHistory = this.inputsHistory.filter(
            ({ sequence }) =>
                sequence >= this.serverGameState.lastValidatedInput,
        );
        const localStateAtInterpolationTime: GameState = JSON.parse(
            JSON.stringify(this.currentState),
        );
        const nextStateAtInterpolationTime: GameState = JSON.parse(
            JSON.stringify(this.serverGameState),
        );

        const inputsAtInterpolationTime: GamePlayerInputPayload[] = JSON.parse(
            JSON.stringify(this.inputsHistory),
        );

        // console.log(JSON.parse(JSON.stringify(localStateAtInterpolationTime)));
        // console.log(JSON.parse(JSON.stringify(nextStateAtInterpolationTime)));
        let lastInputValidated = undefined;
        if (this.lastInputValidated) {
            lastInputValidated = JSON.parse(
                JSON.stringify(this.lastInputValidated),
            );
        }
        while (
            nextStateAtInterpolationTime.game_time <
            localStateAtInterpolationTime.game_time - 1
        ) {
            nextStateAtInterpolationTime.game_time++;
            const inputsForTick = inputsAtInterpolationTime.filter(
                ({ sequence }) =>
                    sequence == nextStateAtInterpolationTime.game_time,
            );
            lastInputValidated = applyInputList(
                this.physicLoop.delta,
                lastInputValidated,
                inputsForTick,
                [
                    FLOOR,
                    ...this.levelController.levels[
                        this.levelController.currentLevel
                    ]!.collidingElements,
                ],
                nextStateAtInterpolationTime,
                Context.client,
                false,
                Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
            );
            for (let i = 0; i < inputsForTick.length; i++) {
                const input = inputsForTick[i];
                inputsAtInterpolationTime.splice(
                    inputsAtInterpolationTime.indexOf(input),
                    1,
                );
            }
        }
        // const distanceAfterInputsApply = this.calculateDistance(
        //     localStateAtInterpolationTime.players[this.playersConfig[0]]
        //         .position,
        //     nextStateAtInterpolationTime.players[this.playersConfig[0]]
        //         .position,
        // );
        // console.log('distance after inputs apply', distanceAfterInputsApply);

        // this.gameStateHistory = this.gameStateHistory.filter(
        //     ({ game_time }) => game_time > this.serverGameState.game_time,
        // );

        // main player update
        this.currentState.players[this.playersConfig[0]].position =
            nextStateAtInterpolationTime.players[
                this.playersConfig[0]
            ].position;
        this.currentState.players[this.playersConfig[0]].velocity =
            nextStateAtInterpolationTime.players[
                this.playersConfig[0]
            ].velocity;

        // other players interpolation
        this.interpolation.shouldUpdate = true;
        this.interpolation.ratio = 0;

        // erase level state
        this.currentState.level = this.serverGameState.level;
    };

    // private checkServerState = () => {
    //     const gameStateAtServerTime = this.gameStateHistory.find(
    //         (state) => state.game_time === this.serverGameState.game_time,
    //     );
    //     if (gameStateAtServerTime) {
    //         const distance = this.calculateDistance(
    //             gameStateAtServerTime.players[1].position,
    //             this.serverGameState.players[1].position,
    //         );
    //         console.log(
    //             'distance with server state received before inputs',
    //             distance,
    //         );
    //     }
    // };

    // private calculateDistance(origin: Vec2, target: Vec2) {
    //     const vector = new Vector2(origin.x, origin.y);
    //     const vectorTarget = new Vector2(target.x, target.y);
    //     return vector.distanceTo(vectorTarget);
    // }

    public updateInterpolation = (
        { ratio, shouldUpdate, increment }: InterpolationConfig,
        delta: number,
    ) => {
        ratio += delta * increment;
        if (ratio >= 1) {
            shouldUpdate = false;
            return 1;
        }

        const vector = new Vector2(
            this.currentState.players[this.playersConfig[1]].position.x,
            this.currentState.players[this.playersConfig[1]].position.y,
        );
        const vectorTarget = new Vector2(
            this.serverGameState.players[this.playersConfig[1]].position.x,
            this.serverGameState.players[this.playersConfig[1]].position.y,
        );
        const targetNormalize = vectorTarget.clone().sub(vector).normalize();
        const distance = vector.distanceTo(vectorTarget) * ratio;

        const displacement = targetNormalize.multiplyScalar(distance);
        // side effect
        this.currentState.players[this.playersConfig[1]].position.x +=
            displacement.x;
        this.currentState.players[this.playersConfig[1]].position.y +=
            displacement.y;

        // console.log('ratio', ratio);
        return ratio;
    };

    public run = () => {
        this.delta = this.clock.getDelta();

        if (this.shouldReconciliateState) {
            this.shouldReconciliateState = false;
            this.reconciliateState();
        }
        this.physicLoop.run((delta) => {
            this.processInputs();
            applySingleInput(
                delta,
                this.playersConfig[0],
                this.inputsManager.inputsActive,
                [
                    FLOOR,
                    ...this.levelController.levels[
                        this.levelController.currentLevel
                    ]!.collidingElements,
                ],
                this.currentState,
                Context.client,
                Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
            );
            // this.gameStateHistory.push(
            //     JSON.parse(JSON.stringify(this.currentState)),
            // );
            if (this.interpolation.shouldUpdate) {
                this.interpolation.ratio = this.updateInterpolation(
                    this.interpolation,
                    delta,
                );
            }
            for (let i = 0; i < this.playersConfig.length; i++) {
                const side = this.playersConfig[i];
                this.players[i].position.set(
                    this.currentState.players[side].position.x,
                    this.currentState.players[side].position.y,
                    0,
                );
            }
            if (this.playerHelper) {
                this.playerHelper.setFromCenterAndSize(
                    this.players[0].position,
                    new Vector3(40, 40),
                );
            }
            this.currentState.game_time++;
        });
        this.updatePlayerGraphics();
        this.updateWorld();
        // console.log(this.currentState.players[this.playersConfig[0]].position);
    };

    public updatePlayerGraphics = () => {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];

            if (player instanceof LightPlayer) {
                this.playerVolumetricLightPass.material.uniforms.lightPosition.value =
                    player.get2dLightPosition(
                        this.camera,
                        this.currentState.players[this.playersConfig[0]]
                            .velocity,
                    );
            }

            if (player instanceof ShadowPlayer) {
                player.update(this.delta);
            }
        }
    };

    private updateWorldPhysic = () => {
        // TODO: Remove code duplication, function is copy pasted from apply world update
        const isPositionLevel = (
            value: LevelState,
        ): value is PositionLevelState =>
            Boolean((value as PositionLevelState).doors);

        // doors
        if (isPositionLevel(this.currentState.level)) {
            for (const key in this.currentState.level.doors) {
                const activators = this.currentState.level.doors[key];

                const doorOpener = this.levelController.levels[
                    this.levelController.currentLevel
                ]!.collidingElements.find(
                    (object) =>
                        object.name === ElementName.AREA_DOOR_OPENER(key),
                )?.children.find(
                    (object) => object.name === ElementName.DOOR_OPENER(key),
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

        // end level
        const endLevelElement = this.levelController.levels[
            this.levelController.currentLevel
        ]!.collidingElements.find(
            (object) => object.name === ElementName.AREA_END_LEVEL,
        )?.children.find((object) => object.name === ElementName.END_LEVEL) as
            | EndLevel
            | undefined;

        if (endLevelElement) {
            if (
                this.currentState.level.end_level.includes(Side.LIGHT) &&
                !endLevelElement.shouldActivateLight
            ) {
                endLevelElement.shouldActivateLight = true;
            }

            if (
                !this.currentState.level.end_level.includes(Side.LIGHT) &&
                endLevelElement.shouldActivateLight
            ) {
                endLevelElement.shouldActivateLight = false;
            }

            if (
                this.currentState.level.end_level.includes(Side.SHADOW) &&
                !endLevelElement.shouldActivateShadow
            ) {
                endLevelElement.shouldActivateShadow = true;
            }

            if (
                !this.currentState.level.end_level.includes(Side.SHADOW) &&
                endLevelElement.shouldActivateShadow
            ) {
                endLevelElement.shouldActivateShadow = false;
            }

            endLevelElement.update(this.delta);
        }
    };

    public updateWorld = () => {
        this.updateWorldPhysic();
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
            this.currentState.players[this.playersConfig[0]].state ===
            MovableComponentState.inside
        ) {
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
