import { Suspense } from 'react';
import { getDictionary } from '../getDictionary';
// import MainApp from './MainApp';
// import { MenuScene } from './types';

export default async function NotFound() {
    const dictionary = await getDictionary('en');
    return (
        <Suspense>
            <h1>Not found</h1>
            {/* <MainApp
                dictionary={dictionary}
                initialScene={MenuScene.NOT_FOUND}
            /> */}
        </Suspense>
    );
}
