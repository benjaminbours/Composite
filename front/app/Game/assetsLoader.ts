import { LoadingManager, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// TODO: don't like that much the fact this function set a object inside a lib, we never use
import { geometries } from '@benjaminbours/composite-core';

export async function startLoadingAssets() {
    return new Promise((resolve) => {
        const manager = new LoadingManager();

        manager.onStart = (url, itemsLoaded, itemsTotal) => {
            console.log(
                'Started loading file: ' +
                    url +
                    '.\nLoaded ' +
                    itemsLoaded +
                    ' of ' +
                    itemsTotal +
                    ' files.',
            );
        };

        // when all assets are load callback
        manager.onLoad = () => {
            console.log('Loading complete!');
            resolve(true);
        };

        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            console.log(
                'Loading file: ' +
                    url +
                    '.\nLoaded ' +
                    itemsLoaded +
                    ' of ' +
                    itemsTotal +
                    ' files.',
            );
        };

        manager.onError = (url) => {
            console.log('There was an error loading ' + url);
        };

        const assetsLoader = new GLTFLoader(manager);
        assetsLoader.load('/assets/geometry/assets.glb', (object: any) => {
            object.scene.children.forEach((mesh: Mesh) => {
                geometries[mesh.name] = mesh.geometry;
            });
        });
    });
}
