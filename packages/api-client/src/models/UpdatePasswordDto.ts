/* tslint:disable */
/* eslint-disable */
/**
 * Composite API
 * Composite the game API
 *
 * The version of the OpenAPI document: 1.0.0-next.20
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
 * @interface UpdatePasswordDto
 */
export interface UpdatePasswordDto {
    /**
     * 
     * @type {string}
     * @memberof UpdatePasswordDto
     */
    password: string;
}

/**
 * Check if a given object implements the UpdatePasswordDto interface.
 */
export function instanceOfUpdatePasswordDto(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "password" in value;

    return isInstance;
}

export function UpdatePasswordDtoFromJSON(json: any): UpdatePasswordDto {
    return UpdatePasswordDtoFromJSONTyped(json, false);
}

export function UpdatePasswordDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdatePasswordDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'password': json['password'],
    };
}

export function UpdatePasswordDtoToJSON(value?: UpdatePasswordDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'password': value.password,
    };
}

