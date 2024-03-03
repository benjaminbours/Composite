import { Container } from 'inversify';
import { ApiClient } from '../services';

const servicesContainer = new Container();
servicesContainer
    .bind<ApiClient>(ApiClient)
    .toSelf()
    .inSingletonScope();

interface AllServicesConfiguration {
    api: {
        origin: string;
    };
}

export function configureServices(config: AllServicesConfiguration) {
    // inject services
    const apiClient = servicesContainer.get(ApiClient);
    // assign config
    apiClient.origin = config.api.origin;
}

export { servicesContainer };
