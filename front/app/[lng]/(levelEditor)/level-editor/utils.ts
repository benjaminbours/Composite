import { Euler, Object3D, Vector3 } from 'three';
import {
    ElementProperties,
    ElementToBounce,
    LevelElement,
    Side,
    addToCollidingElements,
} from '@benjaminbours/composite-core';
import App from '../../../Game/App';

export function removeMeshFromLevel(app: App, mesh: Object3D) {
    if (mesh.id === app.controlledMesh?.id) {
        app.detachTransformControls();
    }
    if (mesh.name.includes('WALL_DOOR')) {
        const id = mesh.name.split('_')[0];
        delete app.gameStateManager.currentState.level.doors[id];
    }
    if (mesh.name.includes('BOUNCE')) {
        const bounce = mesh.children[0] as ElementToBounce;
        const index = app.level.bounces.findIndex((el) => el === mesh);
        app.level.bounces.splice(index, 1);
        delete app.gameStateManager.currentState.level.bounces[bounce.bounceID];
        if (bounce.side === Side.LIGHT) {
            app.rendererManager.removeLightBounceComposer(bounce);
        }
    }
    app.removeFromCollidingElements(mesh);
    app.level.remove(mesh);
}

export function loadElementsToLevel(app: App, elements: LevelElement[]) {
    app.detachTransformControls();
    app.level.clear();
    // load elements to the level
    for (let i = 0; i < elements.length; i++) {
        const { mesh } = elements[i];
        app.level.add(mesh);
        addToCollidingElements(mesh, app.collidingElements);
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
            mesh: el.mesh.clone(),
        };
    });
}
