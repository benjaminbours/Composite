import { LevelStatusEnum } from '@benjaminbours/composite-api-client';
import {
    ElementType,
    EndLevelProperties,
    LevelElement,
    DoorOpenerProperties,
    InteractiveArea,
    WallDoorProperties,
    ElementName,
    Side,
    BounceProperties,
    parseLevelElements,
    WorldContext,
    createElement,
} from '@benjaminbours/composite-core';
import App, { AppMode } from '../../../Game/App';
import { DoorOpenerGraphic } from '../../../Game/elements/DoorOpenerGraphic';
import {
    addBounceGraphic,
    addDoorOpenerGraphic,
    addEndLevelGraphic,
    computeDoorInfo,
    connectDoors,
} from '../../../Game/elements/graphic.utils';
import { PartialLevel } from '../../../types';
import {
    loadElementsToLevel,
    cloneElements,
    addToHistory,
    removeMeshFromLevel,
    applyTransformToMesh,
} from './utils';

export const defaultLevel = {
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

export const initialState = {
    app: undefined as App | undefined,
    appMode: AppMode.EDITOR as AppMode,
    isValidatingProcess: false,
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

export enum ActionType {
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
    LOCK_ELEMENT = 'LOCK_ELEMENT',
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
    payload: {
        mode: AppMode;
        isValidationProcess?: boolean;
    };
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
    payload: { propertyKey: string; value: any; uuid?: string };
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
    payload: {
        type: ElementType;
        uuid: string;
    };
}

interface SelectElementAction {
    type: ActionType.SELECT_ELEMENT;
    /**
     * Element index
     */
    payload: number;
    canUnselect?: boolean;
}

interface LockElementAction {
    type: ActionType.LOCK_ELEMENT;
    /**
     * Element index
     */
    payload: number;
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
    | ToggleShortcutAction
    | LockElementAction;

export function reducer(
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
                appMode: action.payload.mode,
                isValidatingProcess:
                    action.payload.isValidationProcess || false,
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
                    // TODO: I think it's small but performance could be improve here. This code
                    // exist because of react strict mode.
                    // if element already in the scene, does not add it again. Suppose to be trigger only in dev with react strict mode
                    const elem = state.app!.level.children.find(
                        (el) => (el as any).customUUID === action.payload.uuid,
                    );
                    // remove element
                    removeMeshFromLevel(
                        state.app,
                        elem || element.mesh,
                        element.type,
                    );
                    // create a new one
                    const { mesh: newMesh } = createElement(
                        buildWorldContext(state.app),
                        element.type,
                        element.properties,
                    );
                    (newMesh as any).customUUID = action.payload.uuid;
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
        case ActionType.LOCK_ELEMENT:
            elements = state.history[state.historyIndex]
                ? cloneElements(state.history[state.historyIndex])
                : [];
            const item = elements[action.payload];
            item.isLocked = !item.isLocked;
            if (action.payload === state.currentEditingIndex) {
                currentEditingIndex = undefined;
                state.app!.detachTransformControls();
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
                currentEditingIndex,
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
            if (process.env.NODE_ENV === 'development') {
                // TODO: I think it's small but performance could be improve here. This code
                // exist because of react strict mode.
                // if element already in the scene, remove it. Suppose to be trigger only in dev with react strict mode
                const elem = state.app!.level.children.find(
                    (el) => (el as any).customUUID === action.payload.uuid,
                );
                if (elem) {
                    removeMeshFromLevel(state.app!, elem, action.payload.type);
                }
            }
            const elementName = `${action.payload.type}_${elements.length}`;
            const { mesh, properties } = createElement(
                buildWorldContext(state.app!),
                action.payload.type,
            );

            elements.push({
                type: action.payload.type,
                properties,
                mesh,
                name: elementName,
            });
            (mesh as any).customUUID = action.payload.uuid;
            currentEditingIndex = elements.length - 1;
            state.app!.level.add(mesh);
            state.app!.attachTransformControls(mesh);

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
            removeMeshFromLevel(
                state.app!,
                deletedElement[0].mesh,
                deletedElement[0].type,
            );
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
            elements = state.history[state.historyIndex]
                ? cloneElements(state.history[state.historyIndex])
                : [];
            // reset app state
            for (
                let i = 0;
                i < state.app!.rendererManager.lightBounces.length;
                i++
            ) {
                const bounce = state.app!.rendererManager.lightBounces[i];
                state.app!.rendererManager.removeLightBounceComposer(bounce);
            }
            state.app!.level.bounces = [];
            state.app!.gameStateManager.currentState.level.doors = {};
            state.app!.gameStateManager.currentState.level.bounces = {};
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
