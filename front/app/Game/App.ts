// vendors
import {
    Mesh,
    DirectionalLight,
    Scene,
    HemisphereLight,
    Object3D,
    Clock,
    FogExp2,
    IcosahedronGeometry,
    Fog,
    Box3,
    Vector3,
    Box3Helper,
    Object3DEventMap,
} from 'three';
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
    Context,
    MovableComponentState,
    ElementToBounce,
    GameStateUpdatePayload,
    createMountain,
} from '@benjaminbours/composite-core';
// local
import InputsManager from './Player/InputsManager';
import { LightPlayer, Player } from './Player';
// import CustomCamera from './CustomCamera';
import LevelController from './levels/levels.controller';
import { DoorOpener } from './elements/DoorOpener';
import { ShadowPlayer } from './Player/ShadowPlayer';
import SkyShader from './SkyShader';
import { SocketController } from '../SocketController';
import { EndLevel } from './elements/EndLevel';
import { SkinBounce } from './elements/SkinBounce';
import { RendererManager } from './RendererManager';
import CustomCamera from './CustomCamera';
import { GameStateManager } from './GameStateManager';

export default class App {
    public camera = new CustomCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        12000,
    );
    private scene = new Scene();

    private players: Player[] = [];
    private skyMesh!: Mesh;

    public clock = new Clock();
    public delta = this.clock.getDelta();
    private dirLight = new DirectionalLight(0xffffee, 1);

    private levelController: LevelController;

    private shouldReconciliateState = false;

    private lastInput: GamePlayerInputPayload | undefined;

    private physicSimulation = new PhysicSimulation();

    private collidingElements: Object3D<Object3DEventMap>[] = [];

    private playerHelper?: Box3;

    private inputBuffer: GamePlayerInputPayload[] = [];
    private sendInputIntervalId: number = 0;

    // bounce helper
    private currentBounceName?: string;

    private floor = FLOOR;

    public rendererManager: RendererManager;
    public gameStateManager: GameStateManager;

    private mainPlayerSide: Side;
    private secondPlayerSide: Side;

    constructor(
        canvasDom: HTMLCanvasElement,
        initialGameState: GameState,
        playersConfig: Side[],
        public socketController: SocketController,
        public inputsManager: InputsManager,
    ) {
        this.mainPlayerSide = playersConfig[0];
        this.secondPlayerSide = playersConfig[1];
        this.gameStateManager = new GameStateManager(initialGameState);
        // inputs

        // levels
        this.levelController = new LevelController(initialGameState.level.id);

        this.setupPlayers();
        this.setupScene();
        this.scene.updateMatrixWorld();

        // setup renderer manager
        this.rendererManager = new RendererManager(
            this.players,
            this.camera,
            canvasDom,
            this.scene,
            (
                this.levelController.levels[
                    this.levelController.currentLevel
                ] as any
            ).lightBounces || [],
        );

        this.socketController.onGameStateUpdate = (
            data: GameStateUpdatePayload,
        ) => {
            // console.log('received update', data.gameState.game_time);
            this.shouldReconciliateState = true;
            this.gameStateManager.serverGameState = data.gameState;
            this.gameStateManager.lastServerInputs = data.lastInputs;
        };
        this.socketController.synchronizeGameTimeWithServer =
            this.synchronizeGameTimeWithServer;
    }

    destroy = () => {
        console.log('cleared interval');
        clearInterval(this.sendInputIntervalId);
    };

    public synchronizeGameTimeWithServer = (
        serverTime: number,
        rtt: number,
    ) => {
        // this.gameDelta = Math.floor(rtt / 2);
        // this.gameDelta = delta;
        this.gameStateManager.gameTimeIsSynchronized = true;
        // this.bufferHistorySize = this.gameDelta;
        console.log('average RTT', rtt);

        // one trip time

        let sendInputsInterval;
        if (rtt <= 15) {
            this.gameStateManager.gameTimeDelta = 15;
            this.gameStateManager.bufferHistorySize = 15;
            sendInputsInterval = 20;
        } else if (rtt <= 30) {
            this.gameStateManager.gameTimeDelta = rtt;
            this.gameStateManager.bufferHistorySize = 15;
            sendInputsInterval = 20;
        } else if (rtt <= 50) {
            this.gameStateManager.gameTimeDelta = Math.floor(rtt / 1.5);
            this.gameStateManager.bufferHistorySize = 25;
            sendInputsInterval = 30;
        } else if (rtt <= 100) {
            this.gameStateManager.gameTimeDelta = Math.floor(rtt / 2);
            this.gameStateManager.bufferHistorySize = 25;
            sendInputsInterval = 50;
        } else if (rtt <= 200) {
            this.gameStateManager.gameTimeDelta = Math.floor(rtt / 3);
            this.gameStateManager.bufferHistorySize = 50;
            sendInputsInterval = 100;
        } else if (rtt <= 1000) {
            this.gameStateManager.gameTimeDelta = Math.floor(rtt / 10);
            this.gameStateManager.bufferHistorySize = 50;
            sendInputsInterval = 100;
        }
        console.log('game time delta', this.gameStateManager.gameTimeDelta);
        console.log('send inputs interval', sendInputsInterval);
        console.log(
            'buffer history size',
            this.gameStateManager.bufferHistorySize,
        );
        this.gameStateManager.currentState.game_time =
            serverTime + this.gameStateManager.gameTimeDelta;

        // Call sendBufferedInputs at regular intervals
        this.sendInputIntervalId = setInterval(
            this.sendBufferedInputs,
            sendInputsInterval,
        ) as any;
    };

    private setupPlayers = () => {
        for (let i = 0; i < 2; i++) {
            const player = (() => {
                switch (i) {
                    case Side.LIGHT:
                        const lightPlayer = new LightPlayer();
                        lightPlayer.mesh.layers.set(Layer.OCCLUSION_PLAYER);
                        return lightPlayer;
                    case Side.SHADOW:
                        const shadowPlayer = new ShadowPlayer();
                        shadowPlayer.mesh.layers.set(Layer.PLAYER_INSIDE);
                        return shadowPlayer;
                    default:
                        return new LightPlayer();
                }
            })();
            this.players.push(player);
            this.scene.add(player);
        }
    };

    private setupScene = () => {
        this.scene.add(this.floor);
        this.collidingElements.push(this.floor);

        // camera
        this.camera.setDefaultTarget(
            this.players[this.mainPlayerSide].position,
        );
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
        // this.dirLight.shadow.bias = -0.01;
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
            player: this.mainPlayerSide,
            inputs: { ...this.inputsManager.inputsActive },
            time: Date.now(),
            sequence: this.gameStateManager.currentState.game_time,
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
            this.gameStateManager.inputsHistory.push(payload);
            this.collectInput(payload);
        }
        this.lastInput = payload;
    };

    public run = () => {
        this.delta = this.clock.getDelta();
        if (this.shouldReconciliateState) {
            this.shouldReconciliateState = false;
            this.gameStateManager.reconciliateState(
                this.collidingElements,
                this.physicSimulation.delta,
            );
        }
        this.physicSimulation.run((delta) => {
            this.gameStateManager.currentState.game_time++;
            // first player input
            this.processInputs();
            // other player input
            const otherPlayerInput = {
                inputs: this.gameStateManager.lastServerInputs[
                    this.secondPlayerSide
                ]?.inputs || {
                    left: false,
                    right: false,
                    jump: false,
                    top: false,
                    bottom: false,
                },
                sequence: this.gameStateManager.currentState.game_time,
                time: Date.now(),
                player: this.secondPlayerSide,
            };
            this.gameStateManager.inputsHistory.push(otherPlayerInput);

            const inputsForTick: GamePlayerInputPayload[][] = [[], []];
            if (this.lastInput) {
                inputsForTick[this.mainPlayerSide] = [this.lastInput];
            }
            inputsForTick[this.secondPlayerSide] = [otherPlayerInput];

            for (let i = 0; i < inputsForTick.length; i++) {
                const inputs = inputsForTick[i];
                applyInputListToSimulation(
                    delta,
                    undefined,
                    inputs,
                    this.collidingElements,
                    this.gameStateManager.currentState,
                    Context.client,
                    false,
                    Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
                );
            }
            if (this.gameStateManager.gameTimeIsSynchronized) {
                this.gameStateManager.predictionHistory.push(
                    JSON.parse(
                        JSON.stringify(this.gameStateManager.currentState),
                    ),
                );

                if (
                    this.gameStateManager.predictionHistory.length >
                    this.gameStateManager.bufferHistorySize
                ) {
                    this.gameStateManager.predictionHistory.shift();
                }
            }

            // END PREDICTION
            // START DISPLAY TIME

            this.gameStateManager.computeDisplayState();

            for (let i = 0; i < this.players.length; i++) {
                this.players[i].position.set(
                    this.gameStateManager.displayState.players[i].position.x,
                    this.gameStateManager.displayState.players[i].position.y,
                    0,
                );
            }
            this.updateWorldPhysic(this.gameStateManager.displayState);
            if (this.playerHelper) {
                this.playerHelper.setFromCenterAndSize(
                    this.players[0].position,
                    new Vector3(40, 40),
                );
            }
        });
        // TODO: fix player graphic at 60 fps whatever the main render fps is
        this.updatePlayerGraphics(this.gameStateManager.displayState);
        this.updateWorldGraphics(this.gameStateManager.displayState);

        // update camera
        this.camera.update();
    };

    public updatePlayerGraphics = (state: GameState) => {
        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];

            if (player instanceof LightPlayer) {
                this.rendererManager.playerVolumetricLightPass.material.uniforms.lightPosition.value =
                    player.get2dLightPosition(
                        this.camera,
                        state.players[this.mainPlayerSide].velocity,
                    );
                this.rendererManager.playerVolumetricLightPass.material.uniforms.time.value +=
                    this.delta;
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

            const withFocusCamera = activators.includes(this.mainPlayerSide);
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
        this.floor.position.set(this.camera.position.x, 0, 0);

        // sky
        const skyShaderMat = this.skyMesh.material as SkyShader;
        this.skyMesh.position.set(
            this.camera.position.x,
            this.camera.position.y - 2500,
            0,
        );
        skyShaderMat.setSunAngle(200);
        skyShaderMat.render();
        (this.scene.fog as Fog).color.copy(skyShaderMat.getFogColor());
        // sun Hue and atm Hue are not applied with a saturation of 0
        skyShaderMat.setTimeOfDay(0.6, undefined, 0, undefined, 0);
        const lightInfo = skyShaderMat.getLightInfo(this.camera.position);

        this.dirLight.position.copy(lightInfo.position);
        this.dirLight.intensity = lightInfo.intensity;
        this.dirLight.color.copy(lightInfo.color);
        this.dirLight.target.position.set(this.camera.position.x, 0, 0);

        // player inside
        if (
            state.players[this.mainPlayerSide].state ===
                MovableComponentState.inside &&
            state.players[this.mainPlayerSide].insideElementID
        ) {
            const skinBounce = this.levelController.levels[
                this.levelController.currentLevel
            ].children.find(
                (child) =>
                    child.name ===
                    `skin-bounce-${
                        state.players[this.mainPlayerSide].insideElementID
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
    };
}
