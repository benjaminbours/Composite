/* tslint:disable */
/* eslint-disable */
/**
 * Composite API
 * Composite the game API
 *
 * The version of the OpenAPI document: 1.0.0-next.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  CreateLevelDto,
  Level,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  TokensDto,
  UpdateLevelDto,
  UpdatePasswordDto,
  User,
} from '../models/index';
import {
    CreateLevelDtoFromJSON,
    CreateLevelDtoToJSON,
    LevelFromJSON,
    LevelToJSON,
    LoginDtoFromJSON,
    LoginDtoToJSON,
    RegisterDtoFromJSON,
    RegisterDtoToJSON,
    ResetPasswordDtoFromJSON,
    ResetPasswordDtoToJSON,
    TokensDtoFromJSON,
    TokensDtoToJSON,
    UpdateLevelDtoFromJSON,
    UpdateLevelDtoToJSON,
    UpdatePasswordDtoFromJSON,
    UpdatePasswordDtoToJSON,
    UserFromJSON,
    UserToJSON,
} from '../models/index';

export interface AppControllerCheckInviteValidityRequest {
    inviteToken: string;
}

export interface AuthControllerConfirmRequest {
    confirmationToken: string;
}

export interface AuthControllerConfirmResendRequest {
    resetPasswordDto: ResetPasswordDto;
}

export interface AuthControllerLoginRequest {
    loginDto: LoginDto;
}

export interface AuthControllerRegisterRequest {
    registerDto: RegisterDto;
}

export interface AuthControllerResetPasswordRequest {
    resetPasswordDto: ResetPasswordDto;
}

export interface AuthControllerUpdatePasswordRequest {
    resetPasswordToken: string;
    updatePasswordDto: UpdatePasswordDto;
}

export interface LevelsControllerCreateRequest {
    createLevelDto: CreateLevelDto;
}

export interface LevelsControllerFindAllRequest {
    author?: string;
    status?: LevelsControllerFindAllStatusEnum;
}

export interface LevelsControllerFindOneRequest {
    id: string;
}

export interface LevelsControllerRemoveRequest {
    id: string;
}

export interface LevelsControllerUpdateRequest {
    id: string;
    updateLevelDto: UpdateLevelDto;
}

export interface LevelsControllerUploadThumbnailRequest {
    id: string;
    file?: Blob;
}

export interface UsersControllerFindOneRequest {
    id: number;
}

/**
 * 
 */
export class DefaultApi extends runtime.BaseAPI {

    /**
     */
    async appControllerCheckInviteValidityRaw(requestParameters: AppControllerCheckInviteValidityRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<boolean>> {
        if (requestParameters.inviteToken === null || requestParameters.inviteToken === undefined) {
            throw new runtime.RequiredError('inviteToken','Required parameter requestParameters.inviteToken was null or undefined when calling appControllerCheckInviteValidity.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/check-invite/{inviteToken}`.replace(`{${"inviteToken"}}`, encodeURIComponent(String(requestParameters.inviteToken))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<boolean>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async appControllerCheckInviteValidity(requestParameters: AppControllerCheckInviteValidityRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<boolean> {
        const response = await this.appControllerCheckInviteValidityRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async appControllerGetQueueInfoRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/queue-info`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     */
    async appControllerGetQueueInfo(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.appControllerGetQueueInfoRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async appControllerGetVersionRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async appControllerGetVersion(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.appControllerGetVersionRaw(initOverrides);
    }

    /**
     */
    async authControllerConfirmRaw(requestParameters: AuthControllerConfirmRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.confirmationToken === null || requestParameters.confirmationToken === undefined) {
            throw new runtime.RequiredError('confirmationToken','Required parameter requestParameters.confirmationToken was null or undefined when calling authControllerConfirm.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/auth/confirm/{confirmationToken}`.replace(`{${"confirmationToken"}}`, encodeURIComponent(String(requestParameters.confirmationToken))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async authControllerConfirm(requestParameters: AuthControllerConfirmRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.authControllerConfirmRaw(requestParameters, initOverrides);
    }

    /**
     */
    async authControllerConfirmResendRaw(requestParameters: AuthControllerConfirmResendRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<boolean>> {
        if (requestParameters.resetPasswordDto === null || requestParameters.resetPasswordDto === undefined) {
            throw new runtime.RequiredError('resetPasswordDto','Required parameter requestParameters.resetPasswordDto was null or undefined when calling authControllerConfirmResend.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/auth/confirm/resend`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ResetPasswordDtoToJSON(requestParameters.resetPasswordDto),
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<boolean>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async authControllerConfirmResend(requestParameters: AuthControllerConfirmResendRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<boolean> {
        const response = await this.authControllerConfirmResendRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async authControllerLoginRaw(requestParameters: AuthControllerLoginRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokensDto>> {
        if (requestParameters.loginDto === null || requestParameters.loginDto === undefined) {
            throw new runtime.RequiredError('loginDto','Required parameter requestParameters.loginDto was null or undefined when calling authControllerLogin.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/auth/login`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: LoginDtoToJSON(requestParameters.loginDto),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TokensDtoFromJSON(jsonValue));
    }

    /**
     */
    async authControllerLogin(requestParameters: AuthControllerLoginRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokensDto> {
        const response = await this.authControllerLoginRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async authControllerLogoutRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<boolean>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/auth/logout`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<boolean>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async authControllerLogout(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<boolean> {
        const response = await this.authControllerLogoutRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async authControllerRefreshTokenRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokensDto>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/auth/refresh`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TokensDtoFromJSON(jsonValue));
    }

    /**
     */
    async authControllerRefreshToken(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokensDto> {
        const response = await this.authControllerRefreshTokenRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async authControllerRegisterRaw(requestParameters: AuthControllerRegisterRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<TokensDto>> {
        if (requestParameters.registerDto === null || requestParameters.registerDto === undefined) {
            throw new runtime.RequiredError('registerDto','Required parameter requestParameters.registerDto was null or undefined when calling authControllerRegister.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/auth/register`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: RegisterDtoToJSON(requestParameters.registerDto),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => TokensDtoFromJSON(jsonValue));
    }

    /**
     */
    async authControllerRegister(requestParameters: AuthControllerRegisterRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<TokensDto> {
        const response = await this.authControllerRegisterRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async authControllerResetPasswordRaw(requestParameters: AuthControllerResetPasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<boolean>> {
        if (requestParameters.resetPasswordDto === null || requestParameters.resetPasswordDto === undefined) {
            throw new runtime.RequiredError('resetPasswordDto','Required parameter requestParameters.resetPasswordDto was null or undefined when calling authControllerResetPassword.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/auth/reset-password`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: ResetPasswordDtoToJSON(requestParameters.resetPasswordDto),
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<boolean>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async authControllerResetPassword(requestParameters: AuthControllerResetPasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<boolean> {
        const response = await this.authControllerResetPasswordRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async authControllerUpdatePasswordRaw(requestParameters: AuthControllerUpdatePasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<boolean>> {
        if (requestParameters.resetPasswordToken === null || requestParameters.resetPasswordToken === undefined) {
            throw new runtime.RequiredError('resetPasswordToken','Required parameter requestParameters.resetPasswordToken was null or undefined when calling authControllerUpdatePassword.');
        }

        if (requestParameters.updatePasswordDto === null || requestParameters.updatePasswordDto === undefined) {
            throw new runtime.RequiredError('updatePasswordDto','Required parameter requestParameters.updatePasswordDto was null or undefined when calling authControllerUpdatePassword.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        const response = await this.request({
            path: `/auth/update-password/{resetPasswordToken}`.replace(`{${"resetPasswordToken"}}`, encodeURIComponent(String(requestParameters.resetPasswordToken))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: UpdatePasswordDtoToJSON(requestParameters.updatePasswordDto),
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<boolean>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async authControllerUpdatePassword(requestParameters: AuthControllerUpdatePasswordRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<boolean> {
        const response = await this.authControllerUpdatePasswordRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async levelsControllerCreateRaw(requestParameters: LevelsControllerCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Level>> {
        if (requestParameters.createLevelDto === null || requestParameters.createLevelDto === undefined) {
            throw new runtime.RequiredError('createLevelDto','Required parameter requestParameters.createLevelDto was null or undefined when calling levelsControllerCreate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/levels`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: CreateLevelDtoToJSON(requestParameters.createLevelDto),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LevelFromJSON(jsonValue));
    }

    /**
     */
    async levelsControllerCreate(requestParameters: LevelsControllerCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Level> {
        const response = await this.levelsControllerCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async levelsControllerFindAllRaw(requestParameters: LevelsControllerFindAllRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Level>>> {
        const queryParameters: any = {};

        if (requestParameters.author !== undefined) {
            queryParameters['author'] = requestParameters.author;
        }

        if (requestParameters.status !== undefined) {
            queryParameters['status'] = requestParameters.status;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/levels`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(LevelFromJSON));
    }

    /**
     */
    async levelsControllerFindAll(requestParameters: LevelsControllerFindAllRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Level>> {
        const response = await this.levelsControllerFindAllRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async levelsControllerFindOneRaw(requestParameters: LevelsControllerFindOneRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Level>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling levelsControllerFindOne.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/levels/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LevelFromJSON(jsonValue));
    }

    /**
     */
    async levelsControllerFindOne(requestParameters: LevelsControllerFindOneRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Level> {
        const response = await this.levelsControllerFindOneRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async levelsControllerRemoveRaw(requestParameters: LevelsControllerRemoveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Level>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling levelsControllerRemove.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/levels/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LevelFromJSON(jsonValue));
    }

    /**
     */
    async levelsControllerRemove(requestParameters: LevelsControllerRemoveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Level> {
        const response = await this.levelsControllerRemoveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async levelsControllerUpdateRaw(requestParameters: LevelsControllerUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Level>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling levelsControllerUpdate.');
        }

        if (requestParameters.updateLevelDto === null || requestParameters.updateLevelDto === undefined) {
            throw new runtime.RequiredError('updateLevelDto','Required parameter requestParameters.updateLevelDto was null or undefined when calling levelsControllerUpdate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/levels/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'PATCH',
            headers: headerParameters,
            query: queryParameters,
            body: UpdateLevelDtoToJSON(requestParameters.updateLevelDto),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => LevelFromJSON(jsonValue));
    }

    /**
     */
    async levelsControllerUpdate(requestParameters: LevelsControllerUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Level> {
        const response = await this.levelsControllerUpdateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async levelsControllerUploadThumbnailRaw(requestParameters: LevelsControllerUploadThumbnailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<string>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling levelsControllerUploadThumbnail.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters.file !== undefined) {
            formParams.append('file', requestParameters.file as any);
        }

        const response = await this.request({
            path: `/levels/{id}/thumbnail`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<string>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     */
    async levelsControllerUploadThumbnail(requestParameters: LevelsControllerUploadThumbnailRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<string> {
        const response = await this.levelsControllerUploadThumbnailRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async usersControllerFindAllRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<User>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/users`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(UserFromJSON));
    }

    /**
     */
    async usersControllerFindAll(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<User>> {
        const response = await this.usersControllerFindAllRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async usersControllerFindOneRaw(requestParameters: UsersControllerFindOneRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        if (requestParameters.id === null || requestParameters.id === undefined) {
            throw new runtime.RequiredError('id','Required parameter requestParameters.id was null or undefined when calling usersControllerFindOne.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/users/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters.id))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     */
    async usersControllerFindOne(requestParameters: UsersControllerFindOneRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.usersControllerFindOneRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async usersControllerGetProfileRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<User>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("bearer", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/users/profile`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserFromJSON(jsonValue));
    }

    /**
     */
    async usersControllerGetProfile(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<User> {
        const response = await this.usersControllerGetProfileRaw(initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const LevelsControllerFindAllStatusEnum = {
    Draft: 'DRAFT',
    Published: 'PUBLISHED'
} as const;
export type LevelsControllerFindAllStatusEnum = typeof LevelsControllerFindAllStatusEnum[keyof typeof LevelsControllerFindAllStatusEnum];
