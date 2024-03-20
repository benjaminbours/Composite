import { getDictionary } from '../getDictionary';
import MainApp from './MainApp';
import { MenuScene } from './types';

export default async function NotFound() {
    const dictionary = await getDictionary('en');
    return (
        <MainApp dictionary={dictionary} initialScene={MenuScene.NOT_FOUND} />
    );
}
