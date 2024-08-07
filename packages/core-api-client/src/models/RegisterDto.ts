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
 * @interface RegisterDto
 */
export interface RegisterDto {
    /**
     * 
     * @type {string}
     * @memberof RegisterDto
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof RegisterDto
     */
    password: string;
    /**
     * 
     * @type {string}
     * @memberof RegisterDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof RegisterDto
     */
    captcha: string;
}

/**
 * Check if a given object implements the RegisterDto interface.
 */
export function instanceOfRegisterDto(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "email" in value;
    isInstance = isInstance && "password" in value;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "captcha" in value;

    return isInstance;
}

export function RegisterDtoFromJSON(json: any): RegisterDto {
    return RegisterDtoFromJSONTyped(json, false);
}

export function RegisterDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): RegisterDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'email': json['email'],
        'password': json['password'],
        'name': json['name'],
        'captcha': json['captcha'],
    };
}

export function RegisterDtoToJSON(value?: RegisterDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'email': value.email,
        'password': value.password,
        'name': value.name,
        'captcha': value.captcha,
    };
}

