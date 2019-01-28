import { MainTitle, SubtitleHome, TextDrawer, TitleFaction } from "./comps";

export let bothComponents;

export function initBothComponents(currentScene: string) {
    bothComponents = {
        home: {
            mainTitle: new MainTitle(currentScene === "home"),
            title: new SubtitleHome("THINK BOTH WAYS", currentScene === "home"),
        },
        faction: {
            title: new TitleFaction("SELECT A SIDE", currentScene === "faction"),
            // title: new TextDrawer("SELECT A SIDE", currentScene === "faction", {
            //     x: 0.5,
            //     y: 0.2,
            // }),
        },
    };
}

export function runMethodForAllBothComponents(property: string, params: any[]) {
    for (const sceneName in bothComponents) {
        if (bothComponents[sceneName]) {
            const scene = bothComponents[sceneName];
            for (const comp in scene) {
                if (scene[comp].hasOwnProperty(property)) {
                    if (property === "render") {
                        if (scene[comp].isMount || scene[comp].onTransition) {
                            scene[comp][property](...params);
                        }
                    } else {
                        scene[comp][property](...params);
                    }
                }
            }
        }
    }
}
