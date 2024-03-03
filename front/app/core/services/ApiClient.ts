import { injectable } from 'inversify';
import { Configuration, DefaultApi } from '@benjaminbours/composite-api-client';

new Configuration();

@injectable()
export class ApiClient {
    configuration = new Configuration();
    defaultApi = new DefaultApi(this.configuration);

    public get origin() {
        return this.configuration.basePath;
    }
    public set origin(url: string | undefined) {
        this.configuration = new Configuration({
            basePath: url,
            headers: this.headers,
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
            ...this.configuration,
            headers: this.headers,
        });
        this.defaultApi = new DefaultApi(this.configuration);
    }

    private get headers() {
        const token = this._token;
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${this._token}` } : {}),
        };
        return headers;
    }
}
