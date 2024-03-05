// vendors
import { Action, action } from 'easy-peasy';
// our libs
import {
    DoorOpenerProperties,
    ElementType,
    LevelElement,
    WallDoorProperties,
} from '../../../[lng]/level-editor/types';
import { Euler, Object3D, Vector3 } from 'three';
import {
    ElementName,
    ElementToBounce,
    InteractiveArea,
    Side,
    degreesToRadians,
    gridSize,
    radiansToDegrees,
} from '@benjaminbours/composite-core';
import App from '../../../Game/App';
import {
    addMeshToScene,
    addToCollidingElements,
    computeDoorInfo,
    createElement,
    removeMeshFromScene,
} from '../../../[lng]/level-editor/utils';
import { DoorOpener } from '../../../Game/elements/DoorOpener';
// import { Role } from '../../entities';
// import { setCookie } from '../../utils';

/**
 * Store responsible to manage the state of the level editor
 */

export interface LevelEditorModel {
    // properties
    currentEditingIndex: number | undefined;
    levelName: string;
    elements: LevelElement[];
    // actions
    setCurrentEditingIndex: Action<LevelEditorModel, number>;
    setLevelName: Action<LevelEditorModel, string>;
    setElements: Action<LevelEditorModel, LevelElement[]>;
    updateElementTransformation: Action<LevelEditorModel, Object3D>;
    updateElementName: Action<LevelEditorModel, [number, string]>;
    updateElementProperty: Action<LevelEditorModel, [App, string, any]>;
    addElement: Action<LevelEditorModel, Omit<LevelElement, 'name'>>;
    removeElement: Action<LevelEditorModel, number>;

    // thunks
}

export const levelEditorModel: LevelEditorModel = {
    // properties
    currentEditingIndex: undefined,
    levelName: '',
    elements: [],
    // actions
    setCurrentEditingIndex: action((state, payload) => {
        const nextValue =
            payload === state.currentEditingIndex ? undefined : payload;
        state.currentEditingIndex = nextValue;
    }),
    setLevelName: action((state, payload) => {
        state.levelName = payload;
    }),
    setElements: action((state, payload) => {
        state.elements = payload;
    }),
    updateElementTransformation: action((state, object) => {
        const nextState = [...state.elements];
        const index = nextState.findIndex((el) => el.mesh === object);
        nextState[index].properties.position = object.position
            .clone()
            .divideScalar(gridSize);
        const rotationX = radiansToDegrees(object.rotation.x);
        const rotationY = radiansToDegrees(object.rotation.y);
        const rotationZ = radiansToDegrees(object.rotation.z);
        (nextState[index].properties as any).rotation = new Euler(
            rotationX,
            rotationY,
            rotationZ,
        );
        state.elements = nextState;
    }),
    updateElementName: action((state, [index, name]) => {
        const newState = [...state.elements];
        newState[index].name = name;
        state.elements = newState;
    }),
    updateElementProperty: action((state, [app, propertyKey, value]) => {
        if (state.currentEditingIndex === undefined) {
            return;
        }
        const nextState = [...state.elements];
        let { properties, mesh, type } = nextState[state.currentEditingIndex];
        switch (propertyKey) {
            case 'door_id':
                (properties as DoorOpenerProperties)[propertyKey] = value;
                // mesh is a door opener group here
                const areaDoorOpener = mesh.children[0] as InteractiveArea;
                const doorOpener = mesh.children[1] as DoorOpener;
                const wallDoor = state.elements.find(
                    (el) =>
                        el.type === ElementType.WALL_DOOR &&
                        (el.properties as WallDoorProperties).id === value,
                );
                mesh.name = `door-opener-group-${value}`;
                areaDoorOpener.name = ElementName.AREA_DOOR_OPENER(
                    String(value),
                );
                doorOpener.name = ElementName.DOOR_OPENER(String(value));
                if (wallDoor && value !== undefined) {
                    const doorInfo = computeDoorInfo(wallDoor.mesh, doorOpener);
                    doorOpener.doorInfo = doorInfo;
                } else {
                    doorOpener.doorInfo = undefined;
                }
                break;
            case 'side':
            case 'interactive':
            case 'doorPosition':
            case 'size':
                (properties as any)[propertyKey] = (() => {
                    if (propertyKey === 'side') {
                        return value === true ? Side.LIGHT : Side.SHADOW;
                    }
                    return value;
                })();
                // remove element
                removeMeshFromScene(app, nextState, state.currentEditingIndex);
                // create a new one
                const { mesh: newMesh } = createElement(
                    app,
                    type,
                    nextState[state.currentEditingIndex].properties,
                );
                nextState[state.currentEditingIndex].mesh = newMesh;
                addMeshToScene(
                    app,
                    type,
                    nextState[state.currentEditingIndex].mesh,
                );
                break;
            // Transformations
            case 'rotation':
                (properties as any)[propertyKey] = value;
                app.removeFromCollidingElements(mesh);
                const rotationX = degreesToRadians(value.x);
                const rotationY = degreesToRadians(value.y);
                const rotationZ = degreesToRadians(value.z);
                mesh.rotation.set(rotationX, rotationY, rotationZ);
                addToCollidingElements(app, mesh);
                break;
            case 'position':
                (properties as any)[propertyKey] = value;
                app.removeFromCollidingElements(mesh);
                mesh.position.copy(
                    (value as Vector3).clone().multiplyScalar(gridSize),
                );
                addToCollidingElements(app, mesh);
                break;
        }
        state.elements = nextState;
    }),
    addElement: action((state, payload) => {
        state.elements.push({
            ...payload,
            name: `${payload.type}_${state.elements.length}`,
        });
    }),
    removeElement: action((state, index) => {
        const newState = [...state.elements];
        newState.splice(index, 1);
        state.elements = newState;
    }),
    // thunks
};
