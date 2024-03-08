import MainApp from './MainApp';
import { MenuScene } from './types';

export default function NotFound() {
    return <MainApp initialScene={MenuScene.NOT_FOUND} />;
}
