import { ObjectLoader, FileLoader, LoadingManager } from "three";
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
// const assetsLoader = new ObjectLoader(manager);

function onAssetLoaded(response): void {
// function onAssetLoaded(object): void {
    console.log(arguments);
    console.log(JSON.parse(response));
}

export function startLoading() {
    console.log("YO");
    for (const asset of assets) {
        console.log(asset);
        assetsLoader.load(asset.url, onAssetLoaded);
    }
}
