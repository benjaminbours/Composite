import { createStore } from 'easy-peasy';
import {
    UserModel,
    userModel,
    serverInfoModel,
    ServerInfoModel,
} from '../adapters/easy-peasy';

export interface StoreModel {
    user: UserModel;
    serverInfo: ServerInfoModel;
}

const storeModel: StoreModel = {
    user: userModel,
    serverInfo: serverInfoModel,
};

export function configureStore<T>(additionalStores: T) {
    const fullStore = {
        ...storeModel,
        ...additionalStores,
    };

    return createStore(fullStore);
}
