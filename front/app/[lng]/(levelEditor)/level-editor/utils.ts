import { Object3D } from 'three';
import { ElementToBounce, Side } from '@benjaminbours/composite-core';
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
