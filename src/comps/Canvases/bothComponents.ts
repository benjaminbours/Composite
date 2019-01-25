import { MainTitle, SubtitleHome, TextDrawer } from "./comps";

export const bothComponents = {
    home: {
        mainTitle: new MainTitle(),
        title: new SubtitleHome("THINK BOTH WAYS", true),
    },
    faction: {
        title: new TextDrawer("SELECT A SIDE", false, {
            x: 0.5,
            y: 0.2,
        }),
    },
};

export function runMethodForAllBothComponents(property: string, params: any[]) {
    for (const sceneName in bothComponents) {
        if (bothComponents[sceneName]) {
            const scene = bothComponents[sceneName];
            for (const comp in scene) {
                if (scene[comp].hasOwnProperty(property)) {
                    if (scene[comp].isMount || scene[comp].onTransition) {
                        scene[comp][property](...params);
                    }
                }
            }
        }
    }
}
