/* tslint:disable */
/* eslint-disable */
/**
 * Composite API
 * Composite the game API
 *
 * The version of the OpenAPI document: 1.0.0-next.16
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
 * @interface ResetPasswordDto
 */
export interface ResetPasswordDto {
    /**
     * 
     * @type {string}
     * @memberof ResetPasswordDto
     */
    email: string;
}

/**
 * Check if a given object implements the ResetPasswordDto interface.
 */
export function instanceOfResetPasswordDto(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "email" in value;

    return isInstance;
}

export function ResetPasswordDtoFromJSON(json: any): ResetPasswordDto {
    return ResetPasswordDtoFromJSONTyped(json, false);
}

export function ResetPasswordDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): ResetPasswordDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'email': json['email'],
    };
}

export function ResetPasswordDtoToJSON(value?: ResetPasswordDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'email': value.email,
    };
}

