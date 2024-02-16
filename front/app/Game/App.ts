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
    Group,
    PlaneGeometry,
    MeshBasicMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
    createMountain,
    Inputs,
    Levels,
    AbstractLevel,
} from '@benjaminbours/composite-core';
// local
import InputsManager from './Player/InputsManager';
import { LightPlayer, Player } from './Player';
// import CustomCamera from './CustomCamera';
import { DoorOpener } from './elements/DoorOpener';
import { ShadowPlayer } from './Player/ShadowPlayer';
import SkyShader from './SkyShader';
import { SocketController } from '../SocketController';
import { EndLevel } from './elements/EndLevel';
import { SkinBounce } from './elements/SkinBounce';
import { RendererManager } from './RendererManager';
import CustomCamera from './CustomCamera';
import { GameStateManager } from './GameStateManager';
import { EmptyLevel } from './levels/EmptyLevel';
import { CrackTheDoorLevelWithGraphic } from './levels/CrackTheDoorLevelWithGraphic';
import { LearnToFlyLevelWithGraphic } from './levels/LearnToFlyLevelWithGraphic';
import { TheHighSpheresLevelWithGraphic } from './levels/TheHighSpheresWithGraphic';

export enum AppMode {
    EDITOR = 'EDITOR',
    GAME = 'GAME',
}

export default class App {
    public camera = new CustomCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        12000,
    );
    public scene = new Scene();

    private players: Player[] = [];
    private skyMesh!: Mesh;

    public clock = new Clock();
    public delta = this.clock.getDelta();
    private dirLight = new DirectionalLight(0xffffee, 1);

    private lastInput: GamePlayerInputPayload | undefined;
    // TODO: disgusting, find alternative
    private lastOtherPlayerInput: GamePlayerInputPayload | undefined;

    private physicSimulation = new PhysicSimulation();

    public collidingElements: Object3D<Object3DEventMap>[] = [];

    private playerHelper?: Box3;

    // bounce helper
    private currentBounceName?: string;

    private floor = FLOOR;

    public rendererManager: RendererManager;
    public gameStateManager: GameStateManager;

    private mainPlayerSide: Side;
    private secondPlayerSide: Side;

    private level: AbstractLevel;

    public controls?: OrbitControls;

    public mode: AppMode;

    constructor(
        canvasDom: HTMLCanvasElement,
        private initialGameState: GameState,
        playersConfig: Side[],
        public inputsManager: InputsManager,
        initialMode: AppMode,
        public socketController?: SocketController,
    ) {
        this.mode = initialMode;
        this.mainPlayerSide = playersConfig[0];
        this.secondPlayerSide = playersConfig[1];
        this.gameStateManager = new GameStateManager(
            initialGameState,
            this.socketController?.sendInputs,
        );
        // inputs
        if (!socketController && initialMode === AppMode.GAME) {
            this.inputsManager.registerEventListeners();
        }

        // levels
        this.level = (() => {
            switch (initialGameState.level.id) {
                case Levels.EMPTY:
                    return new EmptyLevel();
                case Levels.CRACK_THE_DOOR:
                    return new CrackTheDoorLevelWithGraphic();
                case Levels.LEARN_TO_FLY:
                    return new LearnToFlyLevelWithGraphic();
                case Levels.THE_HIGH_SPHERES:
                    return new TheHighSpheresLevelWithGraphic();
                default:
                    return new EmptyLevel();
            }
        })();
        this.scene.add(this.level as unknown as Group);

        if (this.mode === AppMode.GAME) {
            this.setupPlayers();
        }
        this.setupScene();
        this.scene.updateMatrixWorld();

        // setup renderer manager
        this.rendererManager = new RendererManager(
            this.players,
            this.camera,
            canvasDom,
            this.scene,
            this.level.lightBounces,
        );

        // camera
        if (this.mode === AppMode.EDITOR) {
            this.createEditorCamera();
            // draw collision plane / axis
            const geometry = new PlaneGeometry(10000, 10000);
            const material = new MeshBasicMaterial({
                color: 0xff0000, // red color
                transparent: true,
                opacity: 0.1,
            });
            this.collisionAreaMesh = new Mesh(geometry, material);
            this.collisionAreaMesh.position.y = 10000 / 2;
        } else {
            this.setGameCamera();
        }

        if (this.socketController) {
            this.socketController.registerGameStateUpdateListener(
                this.gameStateManager.onGameGameStateUpdate,
            );
        }
    }

    public resetPlayersPosition = () => {
        this.gameStateManager.currentState.players.forEach((player, index) => {
            player.position = {
                ...this.initialGameState.players[index].position,
            };
        });
    };

    public removeFromCollidingElements = (mesh: Object3D) => {
        const checkChildren = (elements: Object3D[]) => {
            for (let i = 0; i < elements.length; i++) {
                const child = elements[i];
                if (child.name.includes('Occlusion')) {
                    continue;
                }

                if (child.children.length > 0) {
                    checkChildren(child.children);
                } else {
                    const collidingIndex =
                        this.collidingElements.indexOf(child);
                    if (collidingIndex !== -1) {
                        this.collidingElements.splice(collidingIndex, 1);
                    }
                }
            }
        };

        if (mesh.children.length > 0) {
            checkChildren(mesh.children);
        } else {
            const collidingIndex = this.collidingElements.indexOf(mesh);
            if (collidingIndex !== -1) {
                this.collidingElements.splice(collidingIndex, 1);
            }
        }
    };

    public detectIfMeshIsCollidable = (mesh: Mesh) => {
        if (!this.collisionAreaMesh) {
            return false;
        }
        this.scene.updateMatrixWorld(true);

        const geometry = mesh.geometry.clone();
        geometry.applyMatrix4(mesh.matrixWorld);

        const transformedVertices = [];
        for (let i = 0; i < geometry.attributes.position.count; i++) {
            const vertex = new Vector3(
                geometry.attributes.position.getX(i),
                geometry.attributes.position.getY(i),
                geometry.attributes.position.getZ(i),
            );
            transformedVertices.push(vertex);
        }

        const meshBBox = new Box3().setFromPoints(transformedVertices);
        const collisionBBox = new Box3().setFromObject(this.collisionAreaMesh);
        return meshBBox.intersectsBox(collisionBBox);
    };

    public resetEditorCamera = () => {
        this.camera.position.set(0, 100, 500);
        this.controls?.target.set(0, 100, 0);
        this.controls?.update();
    };

    private createEditorCamera = () => {
        this.camera.position.set(0, 100, 500);
        this.controls = new OrbitControls(
            this.camera,
            this.rendererManager.renderer.domElement,
        );
        this.controls.enabled = true;
        this.controls.target.set(0, 100, 0);
        this.controls.enableDamping = false;
        this.controls.enableRotate = false;
        this.controls.autoRotate = false;
        this.controls.maxDistance = 2000;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minPolarAngle = Math.PI / 2;
        this.controls.minAzimuthAngle = Math.PI * 2;
        this.controls.maxAzimuthAngle = Math.PI * 2;
        this.controls.update();
        this.controls.addEventListener('change', () => {
            if (!this.controls) {
                return;
            }

            if (this.controls.object.position.y < 10) {
                this.camera.position.y = 10;
                this.controls.target.y = 10;
            }

            const limitX = 8000;
            if (this.controls.object.position.x > limitX) {
                this.camera.position.x = limitX;
                this.controls.target.x = limitX;
            }

            if (this.controls.object.position.x < -limitX) {
                this.camera.position.x = -limitX;
                this.controls.target.x = -limitX;
            }
        });
    };

    private setGameCamera = () => {
        this.camera.setDefaultTarget(
            this.players[this.mainPlayerSide].position,
        );
        this.camera.position.z = 500;
        this.camera.position.y = 10;
    };

    public setAppMode = (mode: AppMode) => {
        this.mode = mode;
        if (this.mode === AppMode.GAME) {
            this.setupPlayers();
            this.inputsManager.registerEventListeners();
            if (this.controls) {
                this.controls.enabled = false;
                this.setGameCamera();
            }
        } else {
            this.removePlayers();
            this.inputsManager.destroyEventListeners();
            if (this.controls) {
                this.controls.enabled = true;
                this.resetEditorCamera();
            }
        }
    };

    private collisionAreaMesh?: Mesh;
    private isCollisionAreaVisible = false;
    public toggleCollisionArea = () => {
        if (!this.collisionAreaMesh) {
            return;
        }
        if (this.isCollisionAreaVisible) {
            this.isCollisionAreaVisible = false;
            this.scene.remove(this.collisionAreaMesh);
        } else {
            this.isCollisionAreaVisible = true;
            this.scene.add(this.collisionAreaMesh);
        }
    };

    public addToScene = (object: Object3D) => {
        this.scene.add(object);
    };

    public destroy = () => {
        this.gameStateManager.destroy();
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

    private removePlayers = () => {
        this.scene.remove(...this.players);
        this.players = [];
    };

    private setupScene = () => {
        this.scene.add(this.floor);
        this.collidingElements.push(this.floor);

        this.scene.fog = new FogExp2(0xffffff, 0.001);
        // this.scene.fog = new FogExp2(0xffffff, 0.0002);
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

        this.collidingElements.push(...this.level.collidingElements);
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

    private processInputs = (player: Side) => {
        let inputs: Inputs;
        if (player === this.mainPlayerSide) {
            inputs = { ...this.inputsManager.inputsActive };
        } else {
            inputs = this.gameStateManager.lastServerInputs[
                this.secondPlayerSide
            ]?.inputs || {
                left: false,
                right: false,
                jump: false,
                top: false,
                bottom: false,
            };
        }
        const payload = {
            player,
            inputs,
            time: Date.now(),
            sequence: this.gameStateManager.currentState.game_time,
        };
        if (player !== this.mainPlayerSide) {
            this.gameStateManager.inputsHistory.push(payload);
            this.lastOtherPlayerInput = payload;
            return;
        }

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
            this.gameStateManager.collectInput(payload);
        }
        this.lastInput = payload;
    };

    public run = () => {
        this.delta = this.clock.getDelta();
        this.gameStateManager.reconciliateState(
            this.collidingElements,
            this.physicSimulation.delta,
        );
        this.physicSimulation.run((delta) => {
            this.gameStateManager.currentState.game_time++;
            this.processInputs(this.mainPlayerSide);
            this.processInputs(this.secondPlayerSide);

            const inputsForTick: GamePlayerInputPayload[][] = [[], []];
            if (this.lastInput) {
                inputsForTick[this.mainPlayerSide] = [this.lastInput];
            }
            if (this.lastOtherPlayerInput) {
                inputsForTick[this.secondPlayerSide] = [
                    this.lastOtherPlayerInput,
                ];
            }

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
            this.gameStateManager.addToPredictionHistory(
                this.gameStateManager.currentState,
            );

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
        if (this.mode === AppMode.GAME) {
            this.camera.update();
        }
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

            const withFocusCamera =
                activators.includes(this.mainPlayerSide) &&
                this.mode === AppMode.GAME;
            doorOpener?.update(this.delta, this.camera, withFocusCamera);
        }

        for (let i = 0; i < this.level.bounces.length; i++) {
            const bounce = this.level.bounces[i];
            const rotationY = state.level.bounces[i].rotationY;
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
        if (this.players[this.mainPlayerSide]) {
            this.floor.position.set(
                this.players[this.mainPlayerSide].position.x,
                0,
                0,
            );
        }

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
            const skinBounce = (this.level as unknown as Group).children.find(
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
            const skinBounce = (this.level as unknown as Group).children.find(
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
