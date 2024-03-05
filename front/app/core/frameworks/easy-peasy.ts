import { createStore } from 'easy-peasy';
import {
    UserModel,
    userModel,
    LevelEditorModel,
    levelEditorModel,
} from '../adapters/easy-peasy';

export interface StoreModel {
    user: UserModel;
    levelEditor: LevelEditorModel;
}

const storeModel: StoreModel = {
    user: userModel,
    levelEditor: levelEditorModel,
};

export function configureStore<T>(additionalStores: T) {
    const fullStore = {
        ...storeModel,
        ...additionalStores,
    };

    return createStore(fullStore);
}
