import { FileLoader, LoadingManager } from "three";
import { IAsset } from "./types";

const assets: IAsset[] = [
    {
        type: "jsonObj",
        url: "./assets/geometry/mountain.json",
        name: "mountain",
    },
];

const manager = new LoadingManager();

manager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log("Started loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
};

manager.onLoad = () => {
    console.log("Loading complete!");
};

manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log("Loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.");
};

manager.onError = (url) => {
    console.log("There was an error loading " + url);
};

const assetsLoader = new FileLoader(manager);

export function startLoading() {
    assetsLoader.load(assets[0].url);
}
