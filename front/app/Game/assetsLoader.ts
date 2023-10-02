import { LoadingManager, Mesh } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// TODO: don't like that much the fact this function set a object inside a lib, we never use
import { geometries } from '@benjaminbours/composite-core';
import { AssetInfo } from './types';

export async function startLoadingAssets() {
    return new Promise((resolve) => {
        // loaded from public folder
        // TODO: Update this type, its not relevant anymore
        const assets: AssetInfo[] = [
            // {
            //     type: 'jsonObj',
            //     url: '/assets/geometry/mountain.json',
            //     name: 'mountain',
            // },
            {
                type: 'jsonObj',
                url: '/assets/geometry/assets.glb',
                name: 'wall',
            },
        ];

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
        for (const asset of assets) {
            assetsLoader.load(asset.url, (object: any) => {
                object.scene.children.forEach((mesh: Mesh) => {
                    geometries[mesh.name] = mesh.geometry;
                });
            });
        }
    });
}
