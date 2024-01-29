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
    Vec2,
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
    applyInputListToSimulation,
    PhysicSimulation,
    ElementName,
    Layer,
    LevelState,
    Context,
    MovableComponentState,
    ElementToBounce,
    GameStateUpdatePayload,
    BounceState,
    collectInputsForTick,
    createMountain,
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
import { SkinBounce } from './elements/SkinBounce';

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

    private inputsHistory: GamePlayerInputPayload[] = [];
    // its a predicted state if we compare it to the last validated state
    private shouldReconciliateState = false;

    public getCurrentGameState = () => this.currentState;
    private interpolateGameState = (
        states: GameState[],
        t: number,
    ): GameState => {
        const interpolatedState: GameState = JSON.parse(
            JSON.stringify(states[0]),
        );

        // Interpolate each player's position and velocity
        for (let i = 0; i < interpolatedState.players.length; i++) {
            interpolatedState.players[i].position = { x: 0, y: 0 };
            interpolatedState.players[i].velocity = { x: 0, y: 0 };

            for (let j = 0; j < states.length; j++) {
                let basis = 1;
                for (let m = 0; m < states.length; m++) {
                    if (m != j) {
                        basis *=
                            (t - m / (states.length - 1)) /
                            (j / (states.length - 1) - m / (states.length - 1));
                    }
                }

                interpolatedState.players[i].position.x +=
                    basis * states[j].players[i].position.x;
                interpolatedState.players[i].position.y +=
                    basis * states[j].players[i].position.y;
                interpolatedState.players[i].velocity.x +=
                    basis * states[j].players[i].velocity.x;
                interpolatedState.players[i].velocity.y +=
                    basis * states[j].players[i].velocity.y;
            }
        }

        // Interpolate level state and bounces
        if ('level' in states[0] && 'bounces' in states[0].level) {
            const interpolatedBounces: BounceState = {};

            for (const key in states[0].level.bounces) {
                interpolatedBounces[key] = { rotationY: 0 };

                for (let j = 0; j < states.length; j++) {
                    if (key in (states[j].level as any).bounces) {
                        let basis = 1;
                        for (let m = 0; m < states.length; m++) {
                            if (m != j) {
                                basis *=
                                    (t - m / (states.length - 1)) /
                                    (j / (states.length - 1) -
                                        m / (states.length - 1));
                            }
                        }

                        interpolatedBounces[key].rotationY +=
                            basis *
                            (states[j].level as any).bounces[key].rotationY;
                    }
                }
            }

            interpolatedState.level = {
                ...interpolatedState.level,
                bounces: interpolatedBounces,
                // Add other level properties here
            } as any;
        }

        return interpolatedState;
    };

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
    private interpolation: InterpolationConfig = {
        ratio: 0,
        increment: 5,
        shouldUpdate: false,
    };

    private playerHelper?: Box3;

    public lastServerInputs: [
        GamePlayerInputPayload | undefined,
        GamePlayerInputPayload | undefined,
    ] = [undefined, undefined];

    private inputBuffer: GamePlayerInputPayload[] = [];
    private sendInputIntervalId: number = 0;

    // bounce helper
    private currentBounceName?: string;

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
            // console.log('received update', data.gameState.game_time);
            // console.log(this.currentState.game_time);
            // console.log(
            //     'time diff',
            //     this.currentState.game_time - data.gameState.game_time,
            // );

            this.shouldReconciliateState = true;
            this.serverGameState = data.gameState;
            this.lastServerInputs = data.lastInputs;
        };
        this.socketController.synchronizeGameTimeWithServer =
            this.synchronizeGameTimeWithServer;
    }

    destroy = () => {
        console.log('cleared interval');
        clearInterval(this.sendInputIntervalId);
    };

    public resize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    public gameDelta = process.env.NEXT_PUBLIC_SKIP_MATCHMAKING ? 5 : 0;
    public bufferHistorySize = 10;
    public gameTimeIsSynchronized = false;
    public synchronizeGameTimeWithServer = (
        serverTime: number,
        rtt: number,
    ) => {
        // this.gameDelta = Math.floor(rtt / 2);
        // this.gameDelta = delta;
        this.gameTimeIsSynchronized = true;
        // this.bufferHistorySize = this.gameDelta;
        console.log('average RTT', rtt);

        // one trip time

        let sendInputsInterval;
        if (rtt <= 30) {
            this.gameDelta = rtt;
            this.bufferHistorySize = 15;
            sendInputsInterval = 20;
        } else if (rtt <= 50) {
            this.gameDelta = Math.floor(rtt / 1.5);
            this.bufferHistorySize = 25;
            sendInputsInterval = 30;
        } else if (rtt <= 100) {
            this.gameDelta = Math.floor(rtt / 2);
            this.bufferHistorySize = 25;
            sendInputsInterval = 50;
        } else if (rtt <= 200) {
            this.gameDelta = Math.floor(rtt / 3);
            this.bufferHistorySize = 50;
            sendInputsInterval = 100;
        } else if (rtt <= 1000) {
            this.gameDelta = Math.floor(rtt / 10);
            this.bufferHistorySize = 50;
            sendInputsInterval = 100;
        }
        console.log('game time delta', this.gameDelta);
        console.log('send inputs interval', sendInputsInterval);
        console.log('buffer history size', this.bufferHistorySize);
        this.currentState.game_time = serverTime + this.gameDelta;

        // Call sendBufferedInputs at regular intervals
        this.sendInputIntervalId = setInterval(
            this.sendBufferedInputs,
            sendInputsInterval,
        ) as any;
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
        this.scene.add(createMountain());
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

    // Method for collecting player inputs
    public collectInput = (input: GamePlayerInputPayload) => {
        this.inputBuffer.push(input);
    };

    // Method for sending buffered inputs to the server
    public sendBufferedInputs = () => {
        if (this.inputBuffer.length > 0) {
            this.socketController.sendInputs(this.inputBuffer);
            this.inputBuffer = [];
        }
    };

    private processInputs = () => {
        // TODO: Investigate to send pack of inputs, to reduce network usage
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
            this.collectInput(payload);
        }
        this.lastInput = payload;
    };

    private reconciliateState = () => {
        this.inputsHistory = this.inputsHistory.filter(
            ({ sequence }) =>
                sequence >= this.serverGameState.lastValidatedInput,
        );
        const nextState: GameState = JSON.parse(
            JSON.stringify(this.serverGameState),
        );
        const inputs: GamePlayerInputPayload[] = JSON.parse(
            JSON.stringify(this.inputsHistory),
        );
        const predictionHistory: GameState[] = [
            JSON.parse(JSON.stringify(this.serverGameState)),
        ];

        const lastPlayersInput: (GamePlayerInputPayload | undefined)[] = [
            undefined,
            undefined,
        ];
        this.lastServerInputs.forEach((input, index) => {
            if (input) {
                lastPlayersInput[index] = JSON.parse(JSON.stringify(input));
            }
        });
        while (nextState.game_time < this.currentState.game_time) {
            nextState.game_time++;
            const inputsForTick = collectInputsForTick(
                inputs,
                nextState.game_time,
            );

            for (let i = 0; i < inputsForTick.length; i++) {
                const inputs = inputsForTick[i];
                lastPlayersInput[i] = applyInputListToSimulation(
                    this.physicSimulation.delta,
                    lastPlayersInput[i],
                    inputs,
                    [
                        FLOOR,
                        ...this.levelController.levels[
                            this.levelController.currentLevel
                        ]!.collidingElements,
                    ],
                    nextState,
                    Context.client,
                    false,
                    Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
                );
                for (let i = 0; i < inputs.length; i++) {
                    const input = inputs[i];
                    inputs.splice(inputs.indexOf(input), 1);
                }
            }

            const snapshot = JSON.parse(JSON.stringify(nextState));
            predictionHistory.push(snapshot);
            if (predictionHistory.length > this.bufferHistorySize) {
                predictionHistory.shift();
            }
        }

        // const distanceAfterInputsApply = this.calculateDistance(
        //     JSON.parse(
        //         JSON.stringify(
        //             this.currentState.players[this.playersConfig[0]].position,
        //         ),
        //     ),
        //     nextState.players[this.playersConfig[0]].position,
        // );
        // console.log(
        //     'current position',
        //     JSON.parse(
        //         JSON.stringify(
        //             this.currentState.players[this.playersConfig[0]].position,
        //         ),
        //     ),
        // );
        // console.log(
        //     'next position',
        //     nextState.players[this.playersConfig[0]].position,
        // );
        // console.log('distance after inputs apply', distanceAfterInputsApply);

        this.predictionHistory = predictionHistory;
        this.currentState.players = nextState.players;
        this.currentState.level = nextState.level;
    };

    private computeDisplayState = () => {
        if (!this.gameTimeIsSynchronized) {
            this.displayState = this.currentState;
            return;
        }

        // // console.log('HERE', this.predictionHistory.length);
        // this.displayState = this.currentState;
        // return;

        // const ratio = Math.floor(this.gameDelta / 2);
        // const offset = this.gameDelta - 15;
        // const minOffset = 5;
        // const maxOffset = 40;
        // const offset = (() => {
        //     const idealOffset = this.gameDelta - 5;
        //     if (idealOffset > maxOffset) {
        //         return maxOffset;
        //     } else if (idealOffset < minOffset) {
        //         return minOffset;
        //     }
        //     return idealOffset;
        // })();
        // const offset = 15;
        // const ratio = Math.floor(this.gameDelta - 5);
        // console.log('HERE offset', offset);

        // const ratio = this.gameDelta - Math.floor(this.gameDelta * 0.75);
        if (this.predictionHistory.length >= this.bufferHistorySize) {
            // const statesToInterpolate = this.predictionHistory.slice(-offset);
            const interpolatedState = this.interpolateGameState(
                // statesToInterpolate,
                this.predictionHistory,
                this.interpolation.ratio,
            );

            // Update the ratio for the next frame
            this.interpolation.ratio += this.interpolation.increment;

            // If the ratio exceeds 1, we've reached the next state
            if (this.interpolation.ratio >= 1) {
                // // Remove the previous state from the buffer
                this.predictionHistory.shift();

                // Reset the ratio
                this.interpolation.ratio = 0;
            }

            // Update the display state to the interpolated state
            this.displayState = interpolatedState;
        }
    };

    // private calculateDistance(origin: Vec2, target: Vec2) {
    //     const vector = new Vector2(origin.x, origin.y);
    //     const vectorTarget = new Vector2(target.x, target.y);
    //     return vector.distanceTo(vectorTarget);
    // }

    public run = () => {
        this.delta = this.clock.getDelta();
        if (this.shouldReconciliateState) {
            this.shouldReconciliateState = false;
            this.reconciliateState();
        }
        this.physicSimulation.run((delta) => {
            this.currentState.game_time++;
            // first player input
            this.processInputs();
            // other player input
            const otherPlayerInput = {
                inputs: this.lastServerInputs[this.playersConfig[1]]
                    ?.inputs || {
                    left: false,
                    right: false,
                    jump: false,
                    top: false,
                    bottom: false,
                },
                sequence: this.currentState.game_time,
                time: Date.now(),
                player: this.playersConfig[1],
            };
            this.inputsHistory.push({
                inputs: this.lastServerInputs[this.playersConfig[1]]
                    ?.inputs || {
                    left: false,
                    right: false,
                    jump: false,
                    top: false,
                    bottom: false,
                },
                sequence: this.currentState.game_time,
                time: Date.now(),
                player: this.playersConfig[1],
            });

            const inputsForTick: GamePlayerInputPayload[][] = [[], []];
            if (this.lastInput) {
                inputsForTick[this.playersConfig[0]] = [this.lastInput];
            }
            inputsForTick[this.playersConfig[1]] = [otherPlayerInput];

            for (let i = 0; i < inputsForTick.length; i++) {
                const inputs = inputsForTick[i];
                applyInputListToSimulation(
                    delta,
                    undefined,
                    inputs,
                    this.collidingElements,
                    this.currentState,
                    Context.client,
                    // true,
                );
            }
            if (this.gameTimeIsSynchronized) {
                this.predictionHistory.push(
                    JSON.parse(JSON.stringify(this.currentState)),
                );

                if (this.predictionHistory.length > this.bufferHistorySize) {
                    this.predictionHistory.shift();
                }
            }

            // END PREDICTION
            // START DISPLAY TIME

            this.computeDisplayState();

            for (let i = 0; i < this.playersConfig.length; i++) {
                const side = this.playersConfig[i];
                this.players[i].position.set(
                    this.displayState.players[side].position.x,
                    this.displayState.players[side].position.y,
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
        });
        // TODO: fix player graphic at 60 fps whatever the main render fps is
        this.updatePlayerGraphics(this.displayState);
        this.updateWorldGraphics(this.displayState);
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
        // doors
        for (const key in state.level.doors) {
            const activators = state.level.doors[key];

            const doorOpener = this.collidingElements
                .find(
                    (object) =>
                        object.name === ElementName.AREA_DOOR_OPENER(key),
                )
                ?.children.find(
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

            const withFocusCamera = activators.includes(this.playersConfig[0]);
            doorOpener?.update(this.delta, this.camera, withFocusCamera);
        }

        for (
            let i = 0;
            i <
            this.levelController.levels[this.levelController.currentLevel]
                .bounces.length;
            i++
        ) {
            const bounce =
                this.levelController.levels[this.levelController.currentLevel]
                    .bounces[i];
            const rotationY = state.level.bounces[bounce.bounceID].rotationY;
            bounce.update(rotationY);
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

    public updateWorldGraphics = (state: GameState) => {
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

        // player inside
        if (
            state.players[this.playersConfig[0]].state ===
                MovableComponentState.inside &&
            state.players[this.playersConfig[0]].insideElementID
        ) {
            const skinBounce = this.levelController.levels[
                this.levelController.currentLevel
            ].children.find(
                (child) =>
                    child.name ===
                    `skin-bounce-${
                        state.players[this.playersConfig[0]].insideElementID
                    }`,
            ) as SkinBounce | undefined;
            if (skinBounce && !this.currentBounceName) {
                skinBounce.add(skinBounce.directionHelper);
                this.currentBounceName = skinBounce.name;
            }
        } else {
            const skinBounce = this.levelController.levels[
                this.levelController.currentLevel
            ].children.find(
                (child) => child.name === this.currentBounceName,
            ) as SkinBounce | undefined;

            // if there is a currentBounceName, clean it
            if (skinBounce) {
                skinBounce.remove(skinBounce.directionHelper);
                this.currentBounceName = undefined;
            }
        }

        // update camera
        this.camera.update();
    };

    public render = () => {
        const state = this.displayState;
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
            state.players[this.playersConfig[0]].state ===
                MovableComponentState.inside ||
            state.players[this.playersConfig[1]].state ===
                MovableComponentState.inside
        ) {
            if (
                state.players[this.playersConfig[0]].state ===
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
                state.players[this.playersConfig[1]].state ===
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
