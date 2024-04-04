import { useCallback, useEffect, useReducer, useState } from 'react';
import { removeMeshFromLevel } from './utils';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { Euler, Object3D, Vector3 } from 'three';
import {
    ElementName,
    InteractiveArea,
    Side,
    degreesToRadians,
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
    addToCollidingElements,
    EndLevelProperties,
} from '@benjaminbours/composite-core';
import {
    LevelStatusEnum,
    type Level,
} from '@benjaminbours/composite-api-client';
import App from '../../../Game/App';
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
    isNotFound: false,
    isSaving: false,
    isInitialLoadDone: false,
    isAuthModalOpen: false,
    isThumbnailModalOpen: false,
    thumbnailSrc: undefined,
    currentEditingIndex: undefined as number | undefined,
    initialLevel: undefined as PartialLevel | undefined,
    levelName: defaultLevel.name,
    levelStatus: defaultLevel.status as LevelStatusEnum,
    elements: [] as LevelElement[],
    history: [],
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
    | UpdateElementPropertyAction;

function reducer(
    state: typeof initialState,
    action: Action,
): typeof initialState {
    let elements;
    let currentEditingIndex;
    switch (action.type) {
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
            elements = [...state.elements];
            elements[action.payload.index].name = action.payload.name;
            elements[action.payload.index].mesh.name = action.payload.name;
            return {
                ...state,
                elements,
            };
        case ActionType.UPDATE_ELEMENT_PROPERTY:
            if (state.currentEditingIndex === undefined || !state.app) {
                return state;
            }
            elements = [...state.elements];
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
                    addToCollidingElements(
                        element.mesh,
                        state.app.collidingElements,
                    );
                    state.app.attachTransformControls(newMesh);
                    break;
                // Transformations
                case 'transform':
                    state.app.removeFromCollidingElements(element.mesh);
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
                    const rotationX = degreesToRadians(
                        (element.properties as any)[propertyKey].rotation.x,
                    );
                    const rotationY = degreesToRadians(
                        (element.properties as any)[propertyKey].rotation.y,
                    );
                    const rotationZ = degreesToRadians(
                        (element.properties as any)[propertyKey].rotation.z,
                    );
                    // apply rotation and position to mesh
                    element.mesh.position.copy(
                        (value.position as Vector3)
                            .clone()
                            .multiplyScalar(gridSize),
                    );
                    element.mesh.rotation.set(rotationX, rotationY, rotationZ);
                    addToCollidingElements(
                        element.mesh,
                        state.app.collidingElements,
                    );
                    break;
            }

            return {
                ...state,
                elements,
            };
        case ActionType.SAVE_INITIAL_LEVEL:
            return {
                ...state,
                initialLevel: action.payload,
            };
        case ActionType.SELECT_ELEMENT:
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
                    state.elements[currentEditingIndex].mesh,
                );
            }
            // for bounce, only allow rotation on Z (Y)
            if (
                currentEditingIndex !== undefined &&
                state.elements[currentEditingIndex] &&
                state.elements[currentEditingIndex].type ===
                    ElementType.BOUNCE &&
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
            elements = [...state.elements];
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
            addToCollidingElements(mesh, state.app!.collidingElements);
            console.log('HERE add element');

            return {
                ...state,
                elements,
                currentEditingIndex,
            };
        case ActionType.REMOVE_ELEMENT:
            elements = [...state.elements];
            const deletedElement = elements.splice(action.payload, 1);
            removeMeshFromLevel(state.app!, deletedElement[0].mesh);
            return {
                ...state,
                elements,
            };
        case ActionType.LOAD_LEVEL:
            // remove all elements from the scene
            for (let i = 0; i < state.elements.length; i++) {
                const element = state.elements[i];
                removeMeshFromLevel(state.app!, element.mesh);
            }
            const elementList = parseLevelElements(
                buildWorldContext(state.app!),
                action.payload.data,
            );
            const loadElementsToScene = (elementList: LevelElement[]) => {
                for (let i = 0; i < elementList.length; i++) {
                    const { mesh } = elementList[i];
                    if (process.env.NODE_ENV === 'development') {
                        // TODO: I think it's small but performance could be improve here. This code
                        // exist because of react strict mode.
                        // if element already in the scene, remove it. Suppose to be trigger only in dev with react strict mode
                        const elem = state.app!.level.children.find(
                            (el) => el.name === mesh.name,
                        );
                        if (elem) {
                            removeMeshFromLevel(state.app!, elem);
                        }
                    }
                    state.app!.level.add(mesh);
                    addToCollidingElements(mesh, state.app!.collidingElements);
                }
            };
            // load elements to the scene
            loadElementsToScene(elementList);
            return {
                ...state,
                elements: elementList,
                levelName: action.payload.name,
                levelStatus: action.payload.status,
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
    const [history, setHistory] = useState<LevelElement[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(0);
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
            const elementsToSend = state.elements.map((el) => ({
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

    // // Update history when state changes
    // useEffect(() => {
    //     setHistory((prev) => [...prev.slice(0, historyIndex + 1), elements]);
    //     setHistoryIndex((prev) => prev + 1);
    // }, [elements, historyIndex]);

    // // Listen for Ctrl + Z and Ctrl + Shift + Z
    // useEffect(() => {
    //     const handleKeyDown = (event: any) => {
    //         if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    //             event.preventDefault();
    //             // Don't undo past the initial state
    //             if (!event.shiftKey && historyIndex > 0) {
    //                 setHistoryIndex((prev) => prev - 1);
    //             }
    //             // Don't redo past the latest state
    //             else if (event.shiftKey && historyIndex < history.length - 1) {
    //                 setHistoryIndex((prev) => prev + 1);
    //             }
    //         }
    //     };

    //     window.addEventListener('keydown', handleKeyDown);
    //     return () => window.removeEventListener('keydown', handleKeyDown);
    // }, [history, historyIndex]);

    // responsible to register and clear event listeners for the level editor
    useEffect(() => {
        if (!state.app) {
            return;
        }
        const app = state.app;
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

            const index = state.elements.findIndex((el) => {
                return Boolean(
                    findItemInParents(app.mouseSelectedObject, el.mesh),
                );
            });

            if (index !== -1) {
                dispatch({ type: ActionType.SELECT_ELEMENT, payload: index });
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'KeyT': // T
                    app.transformControls?.setMode('translate');
                    break;
                case 'KeyR': // R
                    app.transformControls?.setMode('rotate');
                    break;
                default:
                    break;
            }
            // for bounce, only allow rotation on Z (Y)
            if (
                state.currentEditingIndex !== undefined &&
                state.elements[state.currentEditingIndex] &&
                state.elements[state.currentEditingIndex].type ===
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
        app.canvasDom.addEventListener('mousemove', onMouseMove);
        app.canvasDom.addEventListener('mousedown', onMouseDown);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            app.canvasDom.removeEventListener('mousemove', onMouseMove);
            app.canvasDom.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('keydown', onKeyDown);
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
    };
}
