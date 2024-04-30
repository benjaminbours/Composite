import { Euler, Object3D, Vector3 } from 'three';
import {
    ElementProperties,
    ElementToBounce,
    ElementType,
    LevelElement,
    Side,
    degreesToRadians,
    gridSize,
} from '@benjaminbours/composite-core';
import App from '../../../Game/App';

function removeFromMouseSelectableObjects(app: App, mesh: Object3D) {
    const mouseSelectableObjectsIndex =
        app.mouseSelectableObjects.indexOf(mesh);

    if (mouseSelectableObjectsIndex !== -1) {
        app.mouseSelectableObjects.splice(mouseSelectableObjectsIndex, 1);
    }
}

function removeFromUpdatableElements(app: App, mesh: Object3D) {
    const updatableElementsIndex = app.updatableElements.indexOf(mesh);

    if (updatableElementsIndex !== -1) {
        app.updatableElements.splice(updatableElementsIndex, 1);
    }
}

export function removeMeshFromLevel(
    app: App,
    mesh: Object3D,
    type: ElementType,
) {
    if (mesh.id === app.controlledMesh?.id) {
        app.detachTransformControls();
    }

    switch (type) {
        case ElementType.WALL_DOOR:
            const id = mesh.name.split('_')[0];
            delete app.gameStateManager.predictionState.level.doors[id];
            removeFromMouseSelectableObjects(app, mesh);
            break;
        case ElementType.DOOR_OPENER:
            removeFromUpdatableElements(app, mesh.children[1]);
            removeFromMouseSelectableObjects(app, mesh);
            break;
        case ElementType.BOUNCE:
            const bounce = mesh.children[0] as ElementToBounce;
            const graphicSkin = mesh.children[2];
            const index = app.level.bounces.findIndex((el) => el === mesh);
            app.level.bounces.splice(index, 1);
            delete app.gameStateManager.predictionState.level.bounces[
                bounce.bounceID
            ];
            removeFromMouseSelectableObjects(app, bounce);
            if (graphicSkin) {
                removeFromUpdatableElements(app, graphicSkin);
            }
            if (bounce.side === Side.LIGHT) {
                app.rendererManager.removeLightBounceComposer(bounce);
            }
            break;
        default:
            removeFromMouseSelectableObjects(app, mesh);
            break;
    }
    app.level.remove(mesh);
}

export function loadElementsToLevel(app: App, elements: LevelElement[]) {
    app.detachTransformControls();
    app.level.clear();
    // load elements to the level
    for (let i = 0; i < elements.length; i++) {
        const { mesh } = elements[i];
        applyTransformToMesh(mesh, elements[i].properties.transform);
        app.level.add(mesh);
    }
}

function cloneProperties(properties: ElementProperties) {
    const clone = {};
    Object.entries(properties).forEach(([key, value]) => {
        if (value instanceof Vector3 || value instanceof Euler) {
            (clone as any)[key] = value.clone();
        } else if (key === 'transform') {
            (clone as any)[key] = {
                position: value.position.clone(),
                rotation: value.rotation.clone(),
            };
        } else {
            (clone as any)[key] = value;
        }
    });
    return clone as ElementProperties;
}

export function cloneElements(elements: LevelElement[]) {
    return elements.map((el) => {
        return {
            ...el,
            properties: cloneProperties(el.properties),
        };
    });
}

const HISTORY_LIMIT = 500;
export function addToHistory(
    history: LevelElement[][],
    historyIndex: number,
    nextState: LevelElement[],
) {
    // If we are not at the end of the history, slice the history up to the current index
    let nextHistoryIndex = historyIndex + 1;
    const nextHistory =
        nextHistoryIndex < history.length - 1
            ? history.slice(0, historyIndex + 1)
            : [...history];
    if (nextHistory.length >= HISTORY_LIMIT) {
        nextHistory.shift();
    }
    nextHistory.push(nextState);
    if (nextHistoryIndex > nextHistory.length - 1) {
        nextHistoryIndex -= 1;
    }
    return {
        history: nextHistory,
        historyIndex: nextHistoryIndex,
    };
}

export function applyTransformToMesh(
    mesh: Object3D,
    transform: ElementProperties['transform'],
) {
    const rotationX = degreesToRadians(transform.rotation.x);
    const rotationY = degreesToRadians(transform.rotation.y);
    const rotationZ = degreesToRadians(transform.rotation.z);
    mesh.position.copy(transform.position.clone().multiplyScalar(gridSize));
    mesh.rotation.set(rotationX, rotationY, rotationZ);
}
