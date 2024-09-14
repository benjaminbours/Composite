import { createStore } from 'easy-peasy';
import { UserModel, userModel } from '../adapters/easy-peasy';

export interface StoreModel {
    user: UserModel;
}

const storeModel: StoreModel = {
    user: userModel,
};

export function configureStore<T>(additionalStores: T) {
    const fullStore = {
        ...storeModel,
        ...additionalStores,
    };

    return createStore(fullStore);
}
