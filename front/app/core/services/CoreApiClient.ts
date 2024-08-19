import { injectable } from 'inversify';
import {
    Configuration,
    DefaultApi,
    LevelStatusEnum,
} from '@benjaminbours/composite-core-api-client';

@injectable()
export class CoreApiClient {
    configuration = new Configuration();
    defaultApi = new DefaultApi(this.configuration);

    public get origin() {
        return this.configuration.basePath;
    }
    public set origin(url: string | undefined) {
        this.configuration = new Configuration({
            basePath: url,
        });
        this.defaultApi = new DefaultApi(this.configuration);
    }

    private _token: string | undefined = undefined;
    public get token() {
        return this._token;
    }
    public set token(token: string | undefined) {
        this._token = token;
        this.configuration = new Configuration({
            basePath: this.configuration.basePath,
            accessToken: token,
        });
        this.defaultApi = new DefaultApi(this.configuration);
    }

    fetchPublishedLevels() {
        return this.defaultApi.levelsControllerFindAll({
            status: LevelStatusEnum.Published,
            stats: 'true',
        });
    }
}
