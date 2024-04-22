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
    Vector2,
    Raycaster,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
// our libs
import {
    GamePlayerInputPayload,
    GameState,
    FLOOR_GROUP,
    Side,
    applyInputListToSimulation,
    PhysicSimulation,
    ElementName,
    Layer,
    Context,
    MovableComponentState,
    createMountain,
    InputsSync,
    AbstractLevel,
    degreesToRadians,
    createCollisionAreaMesh,
    LevelMapping,
    ClientGraphicHelpers,
    addToCollidingElements,
    gridSize,
} from '@benjaminbours/composite-core';
// local
import InputsManager from './Player/InputsManager';
import { LightPlayer, Player } from './Player';
// import CustomCamera from './CustomCamera';
import { DoorOpenerGraphic } from './elements/DoorOpenerGraphic';
import { ShadowPlayer } from './Player/ShadowPlayer';
import SkyShader from './SkyShader';
import { SocketController } from '../SocketController';
import { EndLevel } from './elements/EndLevel';
import { SkinBounce } from './elements/SkinBounce';
import { RendererManager } from './RendererManager';
import CustomCamera from './CustomCamera';
import { GameStateManager } from './GameStateManager';
import {
    createBounceGraphic,
    createDoorOpenerGraphic,
    createEndLevelGraphic,
    connectDoors,
} from './elements/graphic.utils';
import { PartialLevel } from '../types';
import { bounceShadowMaterialInteractive, pulseMaterial } from './materials';

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

    private physicSimulation: PhysicSimulation;

    public updatableElements: Object3D[] = [];
    public collidingElements: Object3D<Object3DEventMap>[] = [];

    private playerHelper?: Box3;

    // bounce helper
    private currentBounceName?: string;

    private floor = FLOOR_GROUP;

    public rendererManager: RendererManager;
    public gameStateManager: GameStateManager;

    public mainPlayerSide: Side;
    public secondPlayerSide: Side;

    public level: AbstractLevel & Group;

    public controls?: OrbitControls;
    public transformControls?: TransformControls;

    public mode: AppMode;
    public onLevelEditorValidation: (() => void) | undefined = undefined;
    public mouseSelectableObjects: Object3D[] = [];
    public mousePosition = new Vector2();
    private mouseRaycaster = new Raycaster();
    public mouseSelectedObject?: Object3D;

    constructor(
        public canvasDom: HTMLCanvasElement,
        initialGameState: GameState,
        playersConfig: Side[],
        public inputsManager: InputsManager,
        initialMode: AppMode,
        level?: PartialLevel,
        public socketController?: SocketController,
        onTransformControlsObjectChange?: (e: any) => void,
    ) {
        (this.mouseRaycaster as any).firstHitOnly = true;

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

        // setup renderer manager
        this.rendererManager = new RendererManager(
            this.camera,
            canvasDom,
            this.scene,
        );

        this.physicSimulation = new PhysicSimulation(
            initialMode === AppMode.GAME,
        );

        // levels
        const clientGraphicHelpers: ClientGraphicHelpers = {
            createBounceGraphic,
            createDoorOpenerGraphic,
            createEndLevelGraphic,
            connectDoors,
            addLightBounceComposer: this.rendererManager.addLightBounceComposer,
            updatableElements: this.updatableElements,
            mouseSelectableObjects: this.mouseSelectableObjects,
        };

        this.level = new LevelMapping(
            level?.id || 0,
            level?.data || [],
            {
                light: new Vector3(
                    level?.lightStartPosition[0],
                    level?.lightStartPosition[1] === 0
                        ? 0.08
                        : level?.lightStartPosition[1],
                    0,
                ).multiplyScalar(gridSize),
                shadow: new Vector3(
                    level?.shadowStartPosition[0],
                    level?.shadowStartPosition[1] === 0
                        ? 0.08
                        : level?.shadowStartPosition[1],
                    0,
                ).multiplyScalar(gridSize),
            },
            clientGraphicHelpers,
        );

        this.setupPlayers(this.level.startPosition);
        this.setupScene();
        this.scene.add(this.level);
        this.scene.updateMatrixWorld();

        // camera
        if (this.mode === AppMode.EDITOR) {
            this.transformControls = new TransformControls(
                this.camera,
                canvasDom,
            );
            this.transformControls.name = 'transformControls';
            this.transformControls.addEventListener('objectChange', () => {
                if (this.controlledMesh && onTransformControlsObjectChange) {
                    onTransformControlsObjectChange(this.controlledMesh);
                }
            });
            this.scene.add(this.transformControls);
            this.createEditorCamera();
            // draw collision plane / axis
            this.collisionAreaMesh = createCollisionAreaMesh();
        } else {
            this.setGameCamera();
        }

        if (this.socketController) {
            this.socketController.registerGameStateUpdateListener(
                this.gameStateManager.onGameGameStateUpdate,
            );
        }
    }

    public shouldCaptureSnapshot = false;
    public onCaptureSnapshot = (_image: string) => {};
    public captureSnapshot = () => {
        const canvas = this.rendererManager.canvasDom;
        const image = canvas.toDataURL('image/png');
        this.onCaptureSnapshot(image);
        this.shouldCaptureSnapshot = false;
    };

    public controlledMesh: Object3D | undefined;
    public attachTransformControls = (mesh: Object3D) => {
        this.controlledMesh = mesh;
        this.transformControls?.attach(mesh);
    };

    public detachTransformControls = () => {
        this.controlledMesh = undefined;
        this.transformControls?.detach();
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

    public setGameCamera = () => {
        if (!this.players[this.mainPlayerSide]) {
            return;
        }
        this.camera.setDefaultTarget(
            this.players[this.mainPlayerSide].position,
        );
        this.camera.position.z = 500;
        this.camera.position.y = 10;
    };

    public setAppMode = (mode: AppMode) => {
        this.mode = mode;
        if (this.mode === AppMode.GAME) {
            this.physicSimulation.start();
            this.rendererManager.addPlayerInsideComposer();
            this.inputsManager.registerEventListeners();
            if (this.controls) {
                this.controls.enabled = false;
                this.setGameCamera();
            }
            // reset colliding elements
            this.collidingElements = [];
            for (let i = 0; i < this.level.children.length; i++) {
                const child = this.level.children[i];
                addToCollidingElements(child, this.collidingElements);
            }
        } else {
            this.physicSimulation.stop();
            this.rendererManager.removePlayerInsideComposer();
            this.inputsManager.destroyEventListeners();
            // reset colliding elements
            this.collidingElements = [];
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
        this.socketController?.unregisterGameStateUpdateListener();
    };

    public setPlayersPosition = (position: {
        light: Vector3;
        shadow: Vector3;
    }) => {
        for (let i = 0; i < this.players.length; i++) {
            const vec = i === 0 ? position.shadow : position.light;
            this.players[i].position.set(vec.x, vec.y, 0);
            this.gameStateManager.currentState.players[i].position = {
                x: vec.x,
                y: vec.y,
            };
        }
    };

    private setupPlayers = (startPosition: {
        light: Vector3;
        shadow: Vector3;
    }) => {
        for (let i = 0; i < 2; i++) {
            const player = (() => {
                switch (i) {
                    case Side.LIGHT:
                        const lightPlayer = new LightPlayer();
                        lightPlayer.mesh.layers.set(Layer.OCCLUSION_PLAYER);
                        lightPlayer.position.copy(startPosition.light);
                        return lightPlayer;
                    case Side.SHADOW:
                        const shadowPlayer = new ShadowPlayer();
                        shadowPlayer.mesh.layers.set(Layer.PLAYER_INSIDE);
                        shadowPlayer.position.copy(startPosition.shadow);
                        return shadowPlayer;
                    default:
                        return new LightPlayer();
                }
            })();
            this.players.push(player);
            this.scene.add(player);
        }
        this.rendererManager.players = this.players;
    };

    private setupScene = () => {
        this.scene.add(this.floor);

        this.scene.fog = new FogExp2(0xffffff, 0.001);
        // this.scene.fog = new FogExp2(0xffffff, 0.0002);
        const ambient = new HemisphereLight(0xffffff, 0x000000, 0.1);
        ambient.name = 'ambientLight';

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
        this.dirLight.name = 'dirLight';
        this.dirLight.target.name = 'dirLightTarget';
        this.scene.add(this.dirLight.target);
        this.scene.add(this.dirLight);
        this.scene.add(ambient);
        // sky
        const skyShaderMat = new SkyShader(this.camera);
        const skyBox = new IcosahedronGeometry(10000, 1);
        this.skyMesh = new Mesh(skyBox, skyShaderMat);
        this.skyMesh.name = 'sky-box';
        this.skyMesh.rotation.set(0, 1, 0);
        this.scene.add(this.skyMesh);

        this.collidingElements.push(...this.level.collidingElements);
        this.scene.add(createMountain());
        if (process.env.NEXT_PUBLIC_PLAYER_BBOX_HELPER) {
            this.playerHelper = new Box3();
            this.scene.add(new Box3Helper(this.playerHelper, 0xffff00));
        }
    };

    private lastInput: GamePlayerInputPayload | undefined;
    // TODO: disgusting, find alternative
    private lastOtherPlayerInput: GamePlayerInputPayload | undefined;
    private checkAndCollectInputs = (payload: GamePlayerInputPayload) => {
        const isInputReleased =
            this.lastInput &&
            ((this.lastInput.inputs.left &&
                !this.inputsManager.inputsActive.left) ||
                (this.lastInput.inputs.right &&
                    !this.inputsManager.inputsActive.right) ||
                (this.lastInput.inputs.jump &&
                    !this.inputsManager.inputsActive.jump));
        // basically, if one of the sync input is active or released
        if (
            this.inputsManager.inputsActive.left ||
            this.inputsManager.inputsActive.right ||
            this.inputsManager.inputsActive.jump ||
            isInputReleased
        ) {
            // then collect it
            if (this.gameStateManager.gameTimeIsSynchronized) {
                this.gameStateManager.addToInputsHistory(payload);
                this.gameStateManager.collectInput(payload);
            }
        }
    };

    private createPlayerInputPayload = (player: Side, inputs: InputsSync) => {
        return {
            player,
            inputs,
            time: Date.now(),
            sequence: this.gameStateManager.currentState.game_time,
        };
    };

    private processMainPlayerInputs = () => {
        let inputs: InputsSync = { ...this.inputsManager.inputsActive };
        const payload = this.createPlayerInputPayload(
            this.mainPlayerSide,
            inputs,
        );
        this.checkAndCollectInputs(payload);
        this.lastInput = payload;
    };

    private processSecondPlayerInputs = () => {
        let inputs: InputsSync = this.gameStateManager.lastServerInputs[
            this.secondPlayerSide
        ]?.inputs || {
            left: false,
            right: false,
            jump: false,
            top: false,
            bottom: false,
        };
        const payload = this.createPlayerInputPayload(
            this.secondPlayerSide,
            inputs,
        );
        if (this.gameStateManager.gameTimeIsSynchronized) {
            this.gameStateManager.addToInputsHistory(payload);
        }
        this.lastOtherPlayerInput = payload;
    };

    private updateMouseIntersection = () => {
        // Update the picking ray with the camera and mouse position
        this.mouseRaycaster.setFromCamera(this.mousePosition, this.camera);
        // Calculate objects intersecting the picking ray
        const intersects = this.mouseRaycaster.intersectObjects(
            this.mouseSelectableObjects,
        );
        // If there's an intersection
        if (intersects.length > 0) {
            this.mouseSelectedObject = intersects[0].object;
        } else {
            this.mouseSelectedObject = undefined;
        }
    };

    public run = () => {
        if (this.mode === AppMode.EDITOR) {
            this.updateMouseIntersection();
        }
        this.delta = this.clock.getDelta();
        if (this.mode === AppMode.GAME) {
            this.gameStateManager.reconciliateState(
                this.collidingElements,
                this.physicSimulation.delta,
            );
            this.physicSimulation.run((delta) => {
                this.gameStateManager.currentState.game_time++;
                this.processMainPlayerInputs();
                this.processSecondPlayerInputs();

                const inputs = [];
                if (this.lastInput) {
                    inputs.push(this.lastInput);
                }
                if (this.lastOtherPlayerInput) {
                    inputs.push(this.lastOtherPlayerInput);
                }
                applyInputListToSimulation(
                    delta,
                    [undefined, undefined],
                    inputs,
                    this.collidingElements,
                    this.gameStateManager.currentState,
                    Context.client,
                    false,
                    Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
                );
                if (this.gameStateManager.gameTimeIsSynchronized) {
                    this.gameStateManager.addToPredictionHistory(
                        this.gameStateManager.currentState,
                    );
                }

                // END PREDICTION
                // START DISPLAY TIME

                this.gameStateManager.computeDisplayState();

                for (let i = 0; i < this.players.length; i++) {
                    this.players[i].position.set(
                        this.gameStateManager.displayState.players[i].position
                            .x,
                        this.gameStateManager.displayState.players[i].position
                            .y,
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
        }
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

            const doorOpener = this.collidingElements.find(
                (object) => object.name === ElementName.AREA_DOOR_OPENER(key),
            )?.parent?.children[1] as DoorOpenerGraphic | undefined;

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

            doorOpener?.update(this.delta, this.camera);
            if (doorOpener?.isActive) {
                const shouldFocus =
                    activators.includes(this.mainPlayerSide) &&
                    this.mode === AppMode.GAME &&
                    this.inputsManager.inputsActive.interact;
                doorOpener.focusCamera(this.camera, shouldFocus);
            }
        }

        for (let i = 0; i < this.level.bounces.length; i++) {
            const bounce = this.level.bounces[i];
            const id = Number(bounce.name.split('_')[0]);
            const stateBounce = state.level.bounces[id];
            if (bounce && stateBounce) {
                const rotationY = stateBounce.rotationY;
                bounce.rotation.y = degreesToRadians(rotationY);
            }
        }

        // end level
        const endLevelElement = this.collidingElements.find(
            (object) => object.name === ElementName.AREA_END_LEVEL,
        )?.parent?.children[1] as EndLevel | undefined;

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

            if (
                this.onLevelEditorValidation &&
                state.level.end_level.length === 2
            ) {
                this.onLevelEditorValidation();
            }
        }
    };

    public updateWorldGraphics = (state: GameState) => {
        for (let i = 0; i < this.updatableElements.length; i++) {
            const element: any = this.updatableElements[i];
            if (element.update) {
                element.update(this.delta);
            }
        }
        // update the floor to follow the player to be infinite
        if (this.players[this.mainPlayerSide] && this.mode === AppMode.GAME) {
            this.floor.position.set(
                this.players[this.mainPlayerSide].position.x,
                0,
                0,
            );
        }

        // shared materials
        pulseMaterial.uniforms.time.value += this.delta;
        bounceShadowMaterialInteractive.uniforms.time.value += this.delta;

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
            state.players[this.mainPlayerSide].insideElementID !== undefined
        ) {
            const bounceGroup = this.level.children.find(
                (child) =>
                    child.name ===
                    ElementName.BOUNCE(
                        state.players[this.mainPlayerSide].insideElementID!,
                    ),
            );
            // skin bounce is always the second child in a bounce group
            const skinBounce = bounceGroup?.children[1] as
                | SkinBounce
                | undefined;
            if (skinBounce && !this.currentBounceName) {
                skinBounce.add(skinBounce.directionHelper);
                this.currentBounceName = skinBounce.name;
            }
        } else {
            const bounceGroup = this.level.children.find(
                (child) =>
                    child.name ===
                    ElementName.BOUNCE(
                        state.players[this.mainPlayerSide].insideElementID!,
                    ),
            );
            // skin bounce is always the second child in a bounce group
            const skinBounce = bounceGroup?.children[1] as
                | SkinBounce
                | undefined;

            // if there is a currentBounceName, clean it
            if (skinBounce) {
                skinBounce.remove(skinBounce.directionHelper);
                this.currentBounceName = undefined;
            }
        }
    };
}
