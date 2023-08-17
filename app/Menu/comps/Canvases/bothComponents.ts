import { Scene } from '../../types';
import { MainTitle, SubtitleHome, TitleFaction } from './comps';

export function createBothSideComponents(currentScene: Scene) {
    return {
        home: {
            mainTitle: new MainTitle(currentScene === 'home'),
            title: new SubtitleHome('THINK BOTH WAYS', currentScene === 'home'),
        },
        faction: {
            title: new TitleFaction(
                'SELECT A SIDE',
                currentScene === 'faction',
            ),
            // title: new TextDrawer("SELECT A SIDE", currentScene === "faction", {
            //     x: 0.5,
            //     y: 0.2,
            // }),
        },
    };
}
