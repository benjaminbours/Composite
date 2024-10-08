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
import { gsap } from 'gsap';
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
    createMountain,
    InputsSync,
    AbstractLevel,
    degreesToRadians,
    createCollisionAreaMesh,
    LevelMapping,
    ClientGraphicHelpers,
    addToCollidingElements,
    gridSize,
    GameFinishedPayload,
} from '@benjaminbours/composite-core';
// local
import InputsManager from './Player/InputsManager';
import { LightPlayer, Player } from './Player';
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
import { formatElapsedTime } from '../utils/time';

export enum AppMode {
    EDITOR = 'EDITOR',
    GAME = 'GAME',
}

export default class App {
    public camera = new CustomCamera(
        75,
        window.innerWidth / window.innerHeight,
        10,
        20000,
    );
    public scene = new Scene();

    private players: Player[] = [];
    private skyMesh!: Mesh;

    public runClock = new Clock(false);
    public clock = new Clock();
    public delta = this.clock.getDelta();
    private dirLight = new DirectionalLight(0xffffee, 1);

    private physicSimulation: PhysicSimulation;

    public updatableElements: Object3D[] = [];
    public collidingElements: Object3D<Object3DEventMap>[] = [];

    private playerHelper?: Box3;

    private floor = FLOOR;

    public rendererManager: RendererManager;
    public gameStateManager: GameStateManager;

    public mainPlayerSide: Side;
    public secondPlayerSide: Side;

    public level: AbstractLevel & Group;

    public controls?: OrbitControls;
    public transformControls?: TransformControls;

    public mode: AppMode;
    public onLevelEditorValidation: (() => void) | undefined = undefined;
    public onAddMobileInteractButton: (() => void) | undefined = undefined;
    public onRemoveMobileInteractButton: (() => void) | undefined = undefined;
    public mouseSelectableObjects: Object3D[] = [];
    public mousePosition = new Vector2();
    private mouseRaycaster = new Raycaster();
    public mouseSelectedObject?: Object3D;

    private lastInput: GamePlayerInputPayload;

    constructor(
        public canvasDom: HTMLCanvasElement,
        public canvasMiniMapDom: HTMLCanvasElement,
        initialGameState: GameState,
        playersConfig: Side[],
        public inputsManager: InputsManager,
        initialMode: AppMode,
        level?: PartialLevel,
        public socketController?: SocketController,
        onTransformControlsObjectChange?: (e: any) => void,
        private onPracticeGameFinished?: (data: GameFinishedPayload) => void,
    ) {
        // canvasDom.oncontextmenu = function (e) {
        //     e.preventDefault();
        //     e.stopPropagation();
        // };
        (this.mouseRaycaster as any).firstHitOnly = true;

        this.mode = initialMode;
        this.mainPlayerSide = playersConfig[0];
        this.secondPlayerSide = playersConfig[1];
        this.gameStateManager = new GameStateManager(
            initialGameState,
            this.socketController?.sendInputs,
        );
        this.gameStateManager.mainPlayerSide = playersConfig[0];
        // inputs

        if (!socketController && initialMode === AppMode.GAME) {
            this.inputsManager.registerEventListeners();
        }
        let inputs: InputsSync = { ...this.inputsManager.inputsActive };
        this.lastInput = this.createPlayerInputPayload(
            this.mainPlayerSide,
            inputs,
        );

        // setup renderer manager
        this.rendererManager = new RendererManager(
            this.camera,
            canvasDom,
            canvasMiniMapDom,
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
            updatableElements: this.updatableElements,
            mouseSelectableObjects: this.mouseSelectableObjects,
        };

        this.level = new LevelMapping(
            level?.id || 0,
            level?.data || [],
            {
                light: new Vector3(
                    level?.lightStartPosition[0],
                    level?.lightStartPosition[1],
                    0,
                ).multiplyScalar(gridSize),
                shadow: new Vector3(
                    level?.shadowStartPosition[0],
                    level?.shadowStartPosition[1],
                    0,
                ).multiplyScalar(gridSize),
            },
            clientGraphicHelpers,
        );

        this.gameStateManager.startPosition = this.level.startPosition;

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
            this.rendererManager.addPlayerInsideComposer();
        }

        if (this.socketController) {
            this.socketController.registerGameStateUpdateListener(
                this.gameStateManager.onGameGameStateUpdate,
            );
        }
    }

    public startRun = () => {
        this.runClock.start();
    };

    public stopRun = () => {
        this.runClock.stop();
    };

    private runTimerDomElement = document.querySelector('#runTimer');
    public updateRunDurationCounter = () => {
        if (!this.runTimerDomElement) {
            return;
        }
        this.runTimerDomElement.innerHTML = formatElapsedTime(
            this.runClock.getElapsedTime(),
        );
    };

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

    public resetStates = () => {
        // reset app state
        this.mouseSelectableObjects = [];
        this.updatableElements = [];
        this.level.bounces = [];
        this.level.doorOpeners = [];
        this.gameStateManager.predictionState.level.doors = {};
        this.gameStateManager.predictionState.level.bounces = {};
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
        this.controls.maxDistance = 3000;
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
            this.removeTextOverlay();
            // reset colliding elements
            this.collidingElements = [];
            if (this.controls) {
                this.controls.enabled = true;
                this.resetEditorCamera();
            }
        }
    };

    public switchPlayer = () => {
        const nextSide =
            this.mainPlayerSide === Side.SHADOW ? Side.LIGHT : Side.SHADOW;
        this.mainPlayerSide = nextSide;
        this.gameStateManager.mainPlayerSide = nextSide;
        this.camera.unfocus();
        this.secondPlayerSide =
            nextSide === Side.SHADOW ? Side.LIGHT : Side.SHADOW;
        this.setGameCamera();
    };

    public handleKeyDownSoloMode = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
            event.preventDefault();
            this.switchPlayer();
        }
    };

    public registerSoloModeListeners = () => {
        window.addEventListener('keydown', this.handleKeyDownSoloMode);
    };

    public destroySoloModeListeners = () => {
        window.removeEventListener('keydown', this.handleKeyDownSoloMode);
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
        // TODO: Ensure this is not creating memory leak
        // this.socketController?.unregisterGameStateUpdateListener();
        this.removeTextOverlay();
        this.destroySoloModeListeners();
    };

    public resetSinglePlayerPosition = () => {
        const playerKey =
            this.mainPlayerSide === Side.LIGHT ? 'light' : 'shadow';
        this.gameStateManager.predictionState.players[
            this.mainPlayerSide
        ].position = new Vector2(
            this.level.startPosition[playerKey].x,
            this.level.startPosition[playerKey].y,
        );
        this.gameStateManager.predictionState.players[
            this.mainPlayerSide
        ].velocity = new Vector2(0, 0);
        const payload = this.createPlayerInputPayload(this.mainPlayerSide, {
            left: false,
            right: false,
            jump: false,
            resetPosition: true,
            top: false,
            bottom: false,
        });
        this.lastInput = payload;
        // then collect it
        if (this.gameStateManager.gameTimeIsSynchronized) {
            this.gameStateManager.collectInput(payload);
        }
    };

    public setPlayersPosition = (position: {
        light: Vector3;
        shadow: Vector3;
    }) => {
        for (let i = 0; i < this.players.length; i++) {
            const vec = i === 0 ? position.shadow : position.light;
            this.players[i].position.set(vec.x, vec.y, 0);
            this.gameStateManager.predictionState.players[i].position =
                new Vector2(vec.x, vec.y);
            this.gameStateManager.predictionState.players[i].velocity =
                new Vector2(0, 0);
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
                        lightPlayer.mesh.layers.enable(Layer.MINI_MAP);
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

        this.scene.fog = new FogExp2(0xffffff, 0.0004);
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

    private createPlayerInputPayload = (player: Side, inputs: InputsSync) => {
        return {
            player,
            inputs,
            time: Date.now(),
            sequence: this.gameStateManager.predictionState.game_time,
        };
    };

    private processMainPlayerInputs = () => {
        let inputs: InputsSync = { ...this.inputsManager.inputsActive };
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
            this.inputsManager.inputsActive.resetPosition ||
            isInputReleased
        ) {
            const payload = this.createPlayerInputPayload(
                this.mainPlayerSide,
                inputs,
            );
            this.lastInput = payload;
            // then collect it
            if (this.gameStateManager.gameTimeIsSynchronized) {
                this.gameStateManager.collectInput(payload);
            }
        }
    };

    private processSecondPlayerInputs = () => {
        return (
            this.gameStateManager.lastServerInputs[this.secondPlayerSide] ||
            this.createPlayerInputPayload(this.secondPlayerSide, {
                left: false,
                right: false,
                jump: false,
                top: false,
                bottom: false,
                resetPosition: false,
            })
        );
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
        this.updateRunDurationCounter();
        if (this.mode === AppMode.EDITOR) {
            this.updateMouseIntersection();
        }
        this.delta = this.clock.getDelta();
        if (this.mode === AppMode.GAME) {
            this.physicSimulation.run((delta) => {
                this.gameStateManager.reconciliateState(
                    this.collidingElements,
                    delta,
                );
                this.gameStateManager.predictionState.game_time++;

                this.processMainPlayerInputs();
                const otherPlayerInput = this.processSecondPlayerInputs();

                const inputs = [this.lastInput, otherPlayerInput];
                applyInputListToSimulation(
                    delta,
                    inputs,
                    this.collidingElements,
                    this.gameStateManager.predictionState,
                    this.level.startPosition,
                    Context.client,
                    // if no socket controller, we are in editor mode
                    this.socketController ? this.mainPlayerSide : undefined,
                    false,
                    Boolean(process.env.NEXT_PUBLIC_FREE_MOVEMENT_MODE),
                );
                if (this.gameStateManager.gameTimeIsSynchronized) {
                    this.gameStateManager.addToInputsHistory(
                        this.lastInput,
                        this.gameStateManager.predictionState.game_time,
                    );
                    this.gameStateManager.addToInputsHistory(
                        otherPlayerInput,
                        this.gameStateManager.predictionState.game_time,
                    );
                    this.gameStateManager.addToPredictionHistory(
                        this.gameStateManager.predictionState,
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

    private openTheDoor = (doorRight: Object3D, doorLeft: Object3D) => {
        gsap.to(doorLeft.position, {
            duration: 2,
            x: -100,
            overwrite: true,
        });
        gsap.to(doorRight.position, {
            duration: 2,
            x: 100,
            overwrite: true,
        });
    };

    private closeTheDoor = (doorRight: Object3D, doorLeft: Object3D) => {
        gsap.to([doorLeft.position, doorRight.position], {
            duration: 0.3,
            x: 0,
            overwrite: true,
        });
    };

    private updateWorldPhysic = (state: GameState) => {
        // doors
        let shouldDisplayInteractHelper = false;
        const isMobile = window.innerWidth <= 768 || window.innerHeight <= 500;
        for (const key in state.level.doors) {
            const openers = state.level.doors[key];
            let shouldOpenTheDoor = false;
            let doorRight: Object3D | undefined;
            let doorLeft: Object3D | undefined;

            for (const openerKey in openers) {
                const value = openers[openerKey];
                const doorOpener = this.collidingElements.find(
                    (object) =>
                        object.name ===
                        ElementName.AREA_DOOR_OPENER(key, openerKey),
                )?.parent?.children[1] as DoorOpenerGraphic | undefined;

                if (doorOpener) {
                    doorRight = doorOpener.doorInfo!.doorRight;
                    doorLeft = doorOpener.doorInfo!.doorLeft;
                    if (value.length > 0 && !doorOpener.shouldActivate) {
                        doorOpener.shouldActivate = true;
                    } else if (
                        value.length === 0 &&
                        doorOpener.shouldActivate
                    ) {
                        doorOpener.shouldActivate = false;
                    }
                }
                if (value.length > 0) {
                    shouldOpenTheDoor = true;
                }

                doorOpener?.update(this.delta, this.camera);
                if (
                    doorOpener?.isActive &&
                    value.includes(this.mainPlayerSide)
                ) {
                    shouldDisplayInteractHelper = true;

                    const shouldFocus =
                        value.includes(this.mainPlayerSide) &&
                        this.mode === AppMode.GAME &&
                        this.inputsManager.inputsActive.interact;

                    if (shouldFocus && !isMobile) {
                        shouldDisplayInteractHelper = false;
                    }
                    doorOpener.focusCamera(this.camera, shouldFocus);
                }
            }

            if (doorRight && doorLeft) {
                if (shouldOpenTheDoor) {
                    this.openTheDoor(doorRight, doorLeft);
                } else {
                    this.closeTheDoor(doorRight, doorLeft);
                }
            }
        }

        if (shouldDisplayInteractHelper && !this.isTextOverlayDisplayed) {
            if (isMobile && this.onAddMobileInteractButton) {
                this.isTextOverlayDisplayed = true;
                this.onAddMobileInteractButton();
            } else {
                this.addTextOverlay(
                    'Press <span class="keyboard-key">F</span> to interact',
                );
            }
        } else if (
            !shouldDisplayInteractHelper &&
            this.isTextOverlayDisplayed
        ) {
            if (isMobile && this.onRemoveMobileInteractButton) {
                this.onRemoveMobileInteractButton();
                this.isTextOverlayDisplayed = false;
            } else {
                this.removeTextOverlay();
            }
        }

        // bounces
        for (let i = 0; i < this.level.bounces.length; i++) {
            const bounce = this.level.bounces[i];
            const id = bounce.name.split('_')[0];
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

            // only in practice mode
            let timeoutId: NodeJS.Timeout | undefined;
            if (
                this.onPracticeGameFinished &&
                this.gameStateManager.displayState.level.end_level.length === 2
            ) {
                if (process.env.NEXT_PUBLIC_STAGE === 'local') {
                    this.runClock.stop();
                    this.onPracticeGameFinished({
                        duration: this.runClock.getElapsedTime(),
                        rank: 0,
                    });
                    return;
                }

                timeoutId = setTimeout(() => {
                    if (this.onPracticeGameFinished) {
                        this.runClock.stop();
                        this.onPracticeGameFinished({
                            duration: this.runClock.getElapsedTime(),
                            rank: 0,
                        });
                    }
                }, 2000);
            } else {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }

            if (
                this.onLevelEditorValidation &&
                state.level.end_level.length === 2
            ) {
                this.onLevelEditorValidation();
            }
        }
    };

    private isTextOverlayDisplayed = false;
    private addTextOverlay(html: string): void {
        const overlayDiv = document.createElement('div');
        overlayDiv.innerHTML = html;
        overlayDiv.classList.add('game-text-overlay');
        document.body.appendChild(overlayDiv);
        this.isTextOverlayDisplayed = true;
        gsap.to(overlayDiv, {
            duration: 0.5,
            opacity: 1,
            overwrite: true,
        });
    }

    private removeTextOverlay() {
        this.isTextOverlayDisplayed = false;
        const overlayDiv = document.querySelector('.game-text-overlay');
        gsap.to(overlayDiv, {
            duration: 0.5,
            opacity: 0,
            overwrite: true,
            onComplete: () => {
                if (overlayDiv) {
                    overlayDiv.remove();
                }
            },
        });
    }

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
            if (skinBounce && !skinBounce.isPlayerInside) {
                skinBounce.isPlayerInside = true;
                skinBounce.add(skinBounce.directionHelper);
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
                skinBounce.isPlayerInside = false;
                skinBounce.remove(skinBounce.directionHelper);
            }
        }
    };
}
