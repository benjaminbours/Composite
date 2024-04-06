import { useCallback, useEffect, useReducer, useState } from 'react';
import {
    removeMeshFromLevel,
    loadElementsToLevel,
    cloneElements,
    addToHistory,
    applyTransformToMesh,
} from './utils';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { Euler, Object3D } from 'three';
import {
    ElementName,
    InteractiveArea,
    Side,
    gridSize,
    radiansToDegrees,
    DoorOpenerProperties,
    ElementType,
    LevelElement,
    WallDoorProperties,
    BounceProperties,
    createElement,
    parseLevelElements,
    WorldContext,
    EndLevelProperties,
} from '@benjaminbours/composite-core';
import {
    LevelStatusEnum,
    type Level,
} from '@benjaminbours/composite-api-client';
import App, { AppMode } from '../../../Game/App';
import { DoorOpenerGraphic } from '../../../Game/elements/DoorOpenerGraphic';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import { notFound, useRouter } from 'next/navigation';
import { PartialLevel, Route } from '../../../types';
import { useStoreState } from '../../../hooks';
import { generateErrorNotification } from '../../../utils/errors/generateErrorNotification';
import {
    addBounceGraphic,
    addDoorOpenerGraphic,
    addEndLevelGraphic,
    computeDoorInfo,
    connectDoors,
} from '../../../Game/elements/graphic.utils';
import { startLoadingAssets } from '../../../Game/assetsLoader';

const defaultLevel = {
    id: 0,
    name: '',
    data: [
        {
            name: 'end_level',
            type: ElementType.END_LEVEL,
            properties: JSON.parse(JSON.stringify(new EndLevelProperties())),
        },
    ],
    status: LevelStatusEnum.Draft,
};

const initialState = {
    app: undefined as App | undefined,
    appMode: AppMode.EDITOR as AppMode,
    isNotFound: false,
    isShortcutVisible: false,
    isSaving: false,
    isInitialLoadDone: false,
    isAuthModalOpen: false,
    isThumbnailModalOpen: false,
    thumbnailSrc: undefined,
    currentEditingIndex: undefined as number | undefined,
    initialLevel: undefined as PartialLevel | undefined,
    levelName: defaultLevel.name,
    levelStatus: defaultLevel.status as LevelStatusEnum,
    history: [] as LevelElement[][],
    historyIndex: 0,
    hasErrorWithLevelName: false,
};

enum ActionType {
    LOAD_APP = 'LOAD_APP',
    LOAD_LEVEL = 'LOAD_LEVEL',
    SAVE_INITIAL_LEVEL = 'SAVE_INITIAL_LEVEL',
    LEVEL_IS_NOT_FOUND = 'LEVEL_IS_NOT_FOUND',
    UPDATE_LEVEL_NAME = 'UPDATE_LEVEL_NAME',
    UPDATE_ELEMENT_NAME = 'UPDATE_ELEMENT_NAME',
    UPDATE_ELEMENT_PROPERTY = 'UPDATE_ELEMENT_PROPERTY',
    REMOVE_ELEMENT = 'REMOVE_ELEMENT',
    ADD_ELEMENT = 'ADD_ELEMENT',
    SELECT_ELEMENT = 'SELECT_ELEMENT',
    UNDO = 'UNDO',
    REDO = 'REDO',
    SET_APP_MODE = 'SET_APP_MODE',
    TOGGLE_SHORTCUT = 'TOGGLE_SHORTCUT',
}

interface UndoAction {
    type: ActionType.UNDO;
}

interface RedoAction {
    type: ActionType.REDO;
}

interface ToggleShortcutAction {
    type: ActionType.TOGGLE_SHORTCUT;
}

interface SetAppModeAction {
    type: ActionType.SET_APP_MODE;
    payload: AppMode;
}

interface UpdateLevelNameAction {
    type: ActionType.UPDATE_LEVEL_NAME;
    payload: string;
}

interface UpdateElementNameAction {
    type: ActionType.UPDATE_ELEMENT_NAME;
    payload: { index: number; name: string };
}

interface UpdateElementPropertyAction {
    type: ActionType.UPDATE_ELEMENT_PROPERTY;
    payload: { propertyKey: string; value: any };
}

interface LoadLevelAction {
    type: ActionType.LOAD_LEVEL;
    payload: PartialLevel;
}

interface LoadAppAction {
    type: ActionType.LOAD_APP;
    payload: App;
}

interface SaveInitialLevelAction {
    type: ActionType.SAVE_INITIAL_LEVEL;
    payload: PartialLevel;
}

interface LevelNotFoundAction {
    type: ActionType.LEVEL_IS_NOT_FOUND;
}

interface RemoveElementAction {
    type: ActionType.REMOVE_ELEMENT;
    /**
     * Element index
     */
    payload: number;
}

interface AddElementAction {
    type: ActionType.ADD_ELEMENT;
    payload: ElementType;
}

interface SelectElementAction {
    type: ActionType.SELECT_ELEMENT;
    /**
     * Element index
     */
    payload: number;
    canUnselect?: boolean;
}

type Action =
    | UpdateLevelNameAction
    | LoadLevelAction
    | LoadAppAction
    | SaveInitialLevelAction
    | LevelNotFoundAction
    | RemoveElementAction
    | AddElementAction
    | UpdateElementNameAction
    | SelectElementAction
    | UpdateElementPropertyAction
    | UndoAction
    | RedoAction
    | SetAppModeAction
    | ToggleShortcutAction;

function reducer(
    state: typeof initialState,
    action: Action,
): typeof initialState {
    let elements;
    let currentEditingIndex;
    let historyIndex;
    let historyData;
    switch (action.type) {
        case ActionType.UNDO:
            historyIndex = state.historyIndex - 1;
            elements = state.history[historyIndex];
            loadElementsToLevel(state.app!, elements);
            return {
                ...state,
                historyIndex,
            };
        case ActionType.REDO:
            historyIndex = state.historyIndex + 1;
            elements = state.history[historyIndex];
            loadElementsToLevel(state.app!, elements);
            return {
                ...state,
                historyIndex,
            };
        case ActionType.TOGGLE_SHORTCUT:
            return {
                ...state,
                isShortcutVisible: !state.isShortcutVisible,
            };
        case ActionType.SET_APP_MODE:
            return {
                ...state,
                appMode: action.payload,
            };
        case ActionType.LOAD_APP:
            return {
                ...state,
                app: action.payload,
            };
        case ActionType.LEVEL_IS_NOT_FOUND:
            return {
                ...state,
                isNotFound: true,
            };
        case ActionType.UPDATE_LEVEL_NAME:
            return {
                ...state,
                levelName: action.payload,
            };
        case ActionType.UPDATE_ELEMENT_NAME:
            elements = state.history[state.historyIndex]
                ? cloneElements(state.history[state.historyIndex])
                : [];
            elements[action.payload.index].name = action.payload.name;
            elements[action.payload.index].mesh.name = action.payload.name;
            historyData = addToHistory(
                state.history,
                state.historyIndex,
                elements,
            );
            return {
                ...state,
                historyIndex: historyData.historyIndex,
                history: historyData.history,
            };
        case ActionType.UPDATE_ELEMENT_PROPERTY:
            if (state.currentEditingIndex === undefined || !state.app) {
                return state;
            }
            elements = state.history[state.historyIndex]
                ? cloneElements(state.history[state.historyIndex])
                : [];
            const element = elements[state.currentEditingIndex];
            const { propertyKey, value } = action.payload;

            switch (propertyKey) {
                case 'door_id':
                    (element.properties as DoorOpenerProperties)[propertyKey] =
                        value;
                    // mesh is a door opener group here
                    const areaDoorOpener = element.mesh
                        .children[0] as InteractiveArea;
                    const doorOpener = element.mesh
                        .children[1] as DoorOpenerGraphic;
                    const wallDoor = elements.find(
                        (el) =>
                            el.type === ElementType.WALL_DOOR &&
                            (el.properties as WallDoorProperties).id === value,
                    );
                    element.mesh.name = `door-opener-group-${value}`;
                    areaDoorOpener.name = ElementName.AREA_DOOR_OPENER(
                        String(value),
                    );
                    doorOpener.name = ElementName.DOOR_OPENER(String(value));
                    if (wallDoor && value !== undefined) {
                        const doorInfo = computeDoorInfo(
                            wallDoor.mesh,
                            doorOpener,
                        );
                        doorOpener.doorInfo = doorInfo;
                    } else {
                        doorOpener.doorInfo = undefined;
                    }
                    break;
                case 'side':
                case 'interactive':
                case 'doorPosition':
                case 'size':
                    (element.properties as any)[propertyKey] = (() => {
                        if (propertyKey === 'side') {
                            return value === true ? Side.LIGHT : Side.SHADOW;
                        }
                        return value;
                    })();
                    // remove element
                    removeMeshFromLevel(state.app, element.mesh);
                    // create a new one
                    const { mesh: newMesh } = createElement(
                        buildWorldContext(state.app),
                        element.type,
                        element.properties,
                    );
                    element.mesh = newMesh;
                    // add element
                    state.app.level.add(element.mesh);
                    state.app.attachTransformControls(newMesh);
                    break;
                // Transformations
                case 'transform':
                    // compute position
                    (element.properties as any)[propertyKey].position =
                        value.position;
                    // compute rotation
                    if (element.type === ElementType.BOUNCE) {
                        (element.properties as any)[propertyKey].rotation.y =
                            value.rotation.y;
                        state.app.gameStateManager.currentState.level.bounces[
                            (element.properties as BounceProperties).id
                        ] = {
                            rotationY: value.rotation.y,
                        };
                    } else {
                        (element.properties as any)[propertyKey].rotation =
                            value.rotation;
                    }
                    applyTransformToMesh(element.mesh, value);
                    break;
            }

            historyData = addToHistory(
                state.history,
                state.historyIndex,
                elements,
            );
            return {
                ...state,
                historyIndex: historyData.historyIndex,
                history: historyData.history,
            };
        case ActionType.SAVE_INITIAL_LEVEL:
            return {
                ...state,
                initialLevel: action.payload,
            };
        case ActionType.SELECT_ELEMENT:
            elements = state.history[state.historyIndex] || [];
            if (
                state.currentEditingIndex === action.payload &&
                action.canUnselect
            ) {
                // unselect
                currentEditingIndex = undefined;
                state.app!.detachTransformControls();
            } else {
                // select
                currentEditingIndex = action.payload;
                state.app!.attachTransformControls(
                    elements[currentEditingIndex].mesh,
                );
            }
            // for bounce, only allow rotation on Z (Y)
            if (
                currentEditingIndex !== undefined &&
                elements[currentEditingIndex] &&
                elements[currentEditingIndex].type === ElementType.BOUNCE &&
                state.app!.transformControls?.mode === 'rotate'
            ) {
                state.app!.transformControls!.showX = false;
                state.app!.transformControls!.showY = false;
            } else {
                state.app!.transformControls!.showX = true;
                state.app!.transformControls!.showY = true;
            }
            return {
                ...state,
                currentEditingIndex,
            };
        case ActionType.ADD_ELEMENT:
            elements = state.history[state.historyIndex]
                ? cloneElements(state.history[state.historyIndex])
                : [];
            const elementName = `${action.payload}_${elements.length}`;
            if (process.env.NODE_ENV === 'development') {
                // TODO: I think it's small but performance could be improve here. This code
                // exist because of react strict mode.
                // if element already in the scene, remove it. Suppose to be trigger only in dev with react strict mode
                const elem = state.app!.level.children.find(
                    (el) => el.name === elementName,
                );
                if (elem) {
                    removeMeshFromLevel(state.app!, elem);
                }
            }
            const { mesh, properties } = createElement(
                buildWorldContext(state.app!),
                action.payload,
            );

            elements.push({
                type: action.payload,
                properties,
                mesh,
                name: elementName,
            });
            mesh.name = elementName;
            currentEditingIndex = elements.length;
            state.app!.level.add(mesh);

            historyData = addToHistory(
                state.history,
                state.historyIndex,
                elements,
            );
            return {
                ...state,
                historyIndex: historyData.historyIndex,
                history: historyData.history,
                currentEditingIndex,
            };
        case ActionType.REMOVE_ELEMENT:
            elements = state.history[state.historyIndex]
                ? cloneElements(state.history[state.historyIndex])
                : [];
            const deletedElement = elements.splice(action.payload, 1);
            removeMeshFromLevel(state.app!, deletedElement[0].mesh);
            historyData = addToHistory(
                state.history,
                state.historyIndex,
                elements,
            );
            return {
                ...state,
                historyIndex: historyData.historyIndex,
                history: historyData.history,
            };
        case ActionType.LOAD_LEVEL:
            const elementList = parseLevelElements(
                buildWorldContext(state.app!),
                action.payload.data,
            );
            loadElementsToLevel(state.app!, elementList);
            const history = (() => {
                // first load
                if (!state.isInitialLoadDone) {
                    return [elementList];
                }
                // when load level is trigger after save
                const nextHistory = [...state.history];
                nextHistory.splice(state.historyIndex, 1, elementList);
                return nextHistory;
            })();
            return {
                ...state,
                history,
                levelName: action.payload.name,
                levelStatus: action.payload.status,
                currentEditingIndex: undefined,
                isInitialLoadDone: true,
            };
        default:
            throw new Error();
    }
}

function buildWorldContext(app: App): WorldContext {
    return {
        levelState: app.gameStateManager.currentState.level,
        bounceList: app.level.bounces,
        clientGraphicHelpers: {
            addBounceGraphic,
            addDoorOpenerGraphic,
            addEndLevelGraphic,
            connectDoors,
            addLightBounceComposer: app.rendererManager.addLightBounceComposer,
        },
    };
}

export function useController(
    level_id: string,
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'],
) {
    const isAuthenticated = useStoreState(
        (state) => state.user.isAuthenticated,
    );
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    const [state, dispatch] = useReducer(reducer, initialState);

    const onAppLoaded = useCallback((app: App) => {
        dispatch({ type: ActionType.LOAD_APP, payload: app });
    }, []);

    const [isSaving, setIsSaving] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isThumbnailModalOpen, setIsThumbnailModalOpen] = useState(false);
    const [thumbnailSrc, setIsThumbnailSrc] = useState<string | undefined>(
        undefined,
    );
    const [hasErrorWithLevelName, setHasErrorWithLevelName] = useState(false);

    const handleLevelNameChange = useCallback((e: any) => {
        dispatch({
            type: ActionType.UPDATE_LEVEL_NAME,
            payload: e.target.value,
        });
        if (e.target.value) {
            setHasErrorWithLevelName(false);
        }
    }, []);

    const handleClickOnSave = useCallback(
        (isFork?: boolean, status?: LevelStatusEnum) => {
            if (!state.levelName) {
                enqueueSnackbar(
                    dictionary.notification['error-missing-level-name'],
                    {
                        variant: 'error',
                    },
                );
                setHasErrorWithLevelName(true);
                return;
            }

            if (!isAuthenticated) {
                setIsAuthModalOpen(true);
                return;
            }

            const apiClient = servicesContainer.get(ApiClient);
            const onSuccess = (level: Level) => {
                if (level_id === 'new' || isFork) {
                    router.push(Route.LEVEL_EDITOR(level.id));
                }
                dispatch({
                    type: ActionType.LOAD_LEVEL,
                    payload: level,
                });
                const successMessage = (() => {
                    if (status === LevelStatusEnum.Published) {
                        return dictionary.notification[
                            'success-level-published'
                        ];
                    }

                    if (status === LevelStatusEnum.Draft) {
                        return dictionary.notification[
                            'success-level-unpublished'
                        ];
                    }
                    return dictionary.notification['success-level-saved'];
                })();
                enqueueSnackbar(successMessage, {
                    variant: 'success',
                });
            };
            const onCatch = async (error: any) => {
                console.error(error);
                const errorData = await error.response.json();
                let message;
                if (errorData.message === 'Unique constraint violation') {
                    message = dictionary.notification['error-level-name-taken'];
                    setHasErrorWithLevelName(true);
                } else if (errorData.message.includes('Value is too long')) {
                    message =
                        dictionary.notification['error-level-name-too-long'];
                    setHasErrorWithLevelName(true);
                } else {
                    message = generateErrorNotification(errorData, dictionary);
                }
                enqueueSnackbar(message, {
                    variant: 'error',
                });
            };
            const onFinally = () => {
                setIsSaving(false);
            };

            setIsSaving(true);
            const elements = state.history[state.historyIndex] || [];
            const elementsToSend = elements.map((el) => ({
                type: el.type,
                properties: el.properties,
                name: el.name,
            }));
            if (level_id === 'new' || isFork) {
                apiClient.defaultApi
                    .levelsControllerCreate({
                        createLevelDto: {
                            name: isFork
                                ? `${state.levelName}_forked`
                                : state.levelName,
                            data: elementsToSend,
                        },
                    })
                    .then(onSuccess)
                    .catch(onCatch)
                    .finally(onFinally);
            } else {
                apiClient.defaultApi
                    .levelsControllerUpdate({
                        id: level_id,
                        updateLevelDto: {
                            name: state.levelName,
                            data: elementsToSend,
                            status,
                        },
                    })
                    .then(onSuccess)
                    .catch(onCatch)
                    .finally(onFinally);
            }
        },
        [enqueueSnackbar, dictionary, state, router, level_id, isAuthenticated],
    );

    const handleSaveThumbnail = useCallback(() => {
        if (!thumbnailSrc || level_id === 'new') {
            return;
        }
        setIsThumbnailModalOpen(false);

        function base64ToBlob(base64: string, mimeType = '') {
            // Decode base64 string
            const byteCharacters = atob(base64);

            // Create byte array
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            // Create blob
            const blob = new Blob([byteArray], { type: mimeType });

            return blob;
        }

        const apiClient = servicesContainer.get(ApiClient);
        const base64Data = thumbnailSrc.replace(
            /^data:image\/(png|jpg|jpeg);base64,/,
            '',
        );
        const blob = base64ToBlob(base64Data, 'image/png');

        apiClient.defaultApi
            .levelsControllerUploadThumbnail({
                id: level_id,
                file: blob,
            })
            .then((res) => {
                console.log(res);
                enqueueSnackbar(
                    dictionary.notification['success-level-thumbnail-uploaded'],
                    {
                        variant: 'success',
                    },
                );
            })
            .catch((err) => {
                console.log(err);
                enqueueSnackbar(
                    dictionary.notification['error-level-thumbnail-upload'],
                    {
                        variant: 'error',
                    },
                );
            });
    }, [thumbnailSrc, enqueueSnackbar, dictionary, level_id]);

    const updateElementName = useCallback(
        (index: number) => (e: any) => {
            dispatch({
                type: ActionType.UPDATE_ELEMENT_NAME,
                payload: { index, name: e.target.value },
            });
        },
        [],
    );

    const handleControlObjectChange = useCallback((object: Object3D) => {
        // update element transformations
        const rotationX = radiansToDegrees(object.rotation.x);
        const rotationY = radiansToDegrees(object.rotation.y);
        const rotationZ = radiansToDegrees(object.rotation.z);
        dispatch({
            type: ActionType.UPDATE_ELEMENT_PROPERTY,
            payload: {
                propertyKey: 'transform',
                value: {
                    position: object.position.clone().divideScalar(gridSize),
                    rotation: new Euler(rotationX, rotationY, rotationZ),
                },
            },
        });
    }, []);

    const handleUpdateElementProperty = useCallback(
        (propertyKey: string, value: any) => {
            dispatch({
                type: ActionType.UPDATE_ELEMENT_PROPERTY,
                payload: { propertyKey, value },
            });
        },
        [],
    );

    const addElement = useCallback((type: ElementType) => {
        dispatch({ type: ActionType.ADD_ELEMENT, payload: type });
    }, []);

    const removeElement = useCallback(
        (index: number) => () => {
            dispatch({ type: ActionType.REMOVE_ELEMENT, payload: index });
        },
        [],
    );

    const selectElement = useCallback(
        (index: number) => () => {
            dispatch({
                type: ActionType.SELECT_ELEMENT,
                payload: index,
                canUnselect: true,
            });
        },
        [],
    );

    const toggleTestMode = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.currentTarget.blur();
            if (state.app) {
                state.app.setAppMode(
                    state.app.mode === AppMode.GAME
                        ? AppMode.EDITOR
                        : AppMode.GAME,
                );
                state.app.transformControls?.detach();
                dispatch({
                    type: ActionType.SET_APP_MODE,
                    payload: state.app.mode,
                });
            }
        },
        [state.app],
    );

    const toggleShortcut = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.currentTarget.blur();
            dispatch({
                type: ActionType.TOGGLE_SHORTCUT,
            });
        },
        [],
    );

    // register all key down events
    useEffect(() => {
        if (!state.app) {
            return;
        }
        const app = state.app;
        const elements = state.history[state.historyIndex] || [];
        const updateTransformControlsAxis = () => {
            // for bounce, only allow rotation on Z (Y)
            if (
                state.currentEditingIndex !== undefined &&
                elements[state.currentEditingIndex] &&
                elements[state.currentEditingIndex].type ===
                    ElementType.BOUNCE &&
                app.transformControls?.mode === 'rotate'
            ) {
                app.transformControls!.showX = false;
                app.transformControls!.showY = false;
            } else {
                app.transformControls!.showX = true;
                app.transformControls!.showY = true;
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            // Listen for Ctrl + Z and Ctrl + Shift + Z
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                // Don't undo past the initial state
                if (!event.shiftKey && state.historyIndex > 0) {
                    dispatch({ type: ActionType.UNDO });
                }

                // Don't redo past the latest state
                else if (
                    event.shiftKey &&
                    state.historyIndex < state.history.length - 1
                ) {
                    dispatch({ type: ActionType.REDO });
                }
            } else if (event.code === 'KeyT') {
                app.transformControls?.setMode('translate');
                updateTransformControlsAxis();
            } else if (event.code === 'KeyR') {
                app.transformControls?.setMode('rotate');
                updateTransformControlsAxis();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        state.history,
        state.historyIndex,
        state.app,
        state.currentEditingIndex,
    ]);

    // responsible to register and clear mouse event listeners
    useEffect(() => {
        if (!state.app) {
            return;
        }
        const app = state.app;
        const elements = state.history[state.historyIndex] || [];
        function isMouseLeftButton(event: any) {
            if (
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                event.shiftKey
            ) {
                return false;
            } else if ('buttons' in event) {
                return event.buttons === 1;
            } else if ('which' in event) {
                return event.which === 1;
            } else {
                return event.button == 1 || event.type == 'click';
            }
        }
        const onMouseMove = (e: MouseEvent) => {
            app.mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
            app.mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        const onMouseDown = (e: MouseEvent) => {
            if (!app.mouseSelectedObject) {
                return;
            }

            if (!isMouseLeftButton(e)) {
                return;
            }

            function findItemInParents(object: any, item: any) {
                // If the current object is the item, return it
                if (object === item) {
                    return object;
                }

                // If the current object has a parent, search in the parent
                if (object.parent) {
                    return findItemInParents(object.parent, item);
                }

                // If the item was not found, return null
                return null;
            }

            const index = elements.findIndex((el) => {
                return Boolean(
                    findItemInParents(app.mouseSelectedObject, el.mesh),
                );
            });

            if (index !== -1) {
                dispatch({ type: ActionType.SELECT_ELEMENT, payload: index });
            }
        };

        app.canvasDom.addEventListener('mousemove', onMouseMove);
        app.canvasDom.addEventListener('mousedown', onMouseDown);
        return () => {
            app.canvasDom.removeEventListener('mousemove', onMouseMove);
            app.canvasDom.removeEventListener('mousedown', onMouseDown);
        };
    }, [state]);

    // effect responsible to close the auth modal after successful login
    useEffect(() => {
        if (isAuthenticated && isAuthModalOpen) {
            setIsAuthModalOpen(false);
        }
    }, [isAuthenticated, isAuthModalOpen]);

    // effect responsible to load the level data from the api
    useEffect(() => {
        const apiClient = servicesContainer.get(ApiClient);
        // load level
        Promise.all([
            startLoadingAssets(),
            level_id === 'new'
                ? undefined
                : apiClient.defaultApi.levelsControllerFindOne({
                      id: level_id,
                  }),
        ])
            .then(([_, level]) => {
                console.log('level loaded', level);
                dispatch({
                    type: ActionType.SAVE_INITIAL_LEVEL,
                    payload: level || defaultLevel,
                });
            })
            .catch((error) => {
                console.error(error);
                dispatch({ type: ActionType.LEVEL_IS_NOT_FOUND });
            });
    }, [level_id]);

    // effect loading the scene when assets and level data are ready
    // TODO: Can be remove and do in the reducer potentially
    useEffect(() => {
        // if the app is not ready, don't do anything
        if (!state.app || !state.initialLevel || state.isInitialLoadDone) {
            return;
        }

        dispatch({
            type: ActionType.LOAD_LEVEL,
            payload: state.initialLevel,
        });
    }, [state]);

    if (state.isNotFound) {
        notFound();
    }

    return {
        state,
        hasErrorWithLevelName,
        isAuthModalOpen,
        isThumbnailModalOpen,
        thumbnailSrc,
        isSaving,
        handleLevelNameChange,
        handleClickOnSave,
        handleSaveThumbnail,
        updateElementName,
        handleControlObjectChange,
        handleUpdateElementProperty,
        addElement,
        removeElement,
        onAppLoaded,
        selectElement,
        setIsAuthModalOpen,
        setIsThumbnailModalOpen,
        setIsThumbnailSrc,
        toggleTestMode,
        toggleShortcut,
    };
}
