import 'reflect-metadata';
import { Container } from 'inversify';
import { CoreApiClient } from '../services';

const servicesContainer = new Container();
servicesContainer
    .bind<CoreApiClient>(CoreApiClient)
    .toSelf()
    .inSingletonScope();

interface AllServicesConfiguration {
    api: {
        origin: string;
    };
}

export function configureServices(config: AllServicesConfiguration) {
    // inject services
    const apiClient = servicesContainer.get(CoreApiClient);
    // assign config
    apiClient.origin = config.api.origin;
}

export { servicesContainer };
