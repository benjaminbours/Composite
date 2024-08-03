/* tslint:disable */
/* eslint-disable */
/**
 * Composite API
 * Composite the game API
 *
 * The version of the OpenAPI document: 1.0.0-next.21
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface TokensDto
 */
export interface TokensDto {
    /**
     * An access token that should be use as a Bearer token in all subsequent requests
     * @type {string}
     * @memberof TokensDto
     */
    accessToken: string;
    /**
     * A refresh token that is used by front end app mechanism to refresh user sessions
     * @type {string}
     * @memberof TokensDto
     */
    refreshToken: string;
}

/**
 * Check if a given object implements the TokensDto interface.
 */
export function instanceOfTokensDto(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "accessToken" in value;
    isInstance = isInstance && "refreshToken" in value;

    return isInstance;
}

export function TokensDtoFromJSON(json: any): TokensDto {
    return TokensDtoFromJSONTyped(json, false);
}

export function TokensDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): TokensDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'accessToken': json['access_token'],
        'refreshToken': json['refresh_token'],
    };
}

export function TokensDtoToJSON(value?: TokensDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'access_token': value.accessToken,
        'refresh_token': value.refreshToken,
    };
}
