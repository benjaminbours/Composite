/* tslint:disable */
/* eslint-disable */
/**
 * Composite API
 * Composite the game API
 *
 * The version of the OpenAPI document: 1.0.0-next.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { Element } from './Element';
import {
    ElementFromJSON,
    ElementFromJSONTyped,
    ElementToJSON,
} from './Element';

/**
 * 
 * @export
 * @interface CreateLevelDto
 */
export interface CreateLevelDto {
    /**
     * 
     * @type {string}
     * @memberof CreateLevelDto
     */
    name: string;
    /**
     * 
     * @type {Array<Element>}
     * @memberof CreateLevelDto
     */
    data: Array<Element>;
}

/**
 * Check if a given object implements the CreateLevelDto interface.
 */
export function instanceOfCreateLevelDto(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "data" in value;

    return isInstance;
}

export function CreateLevelDtoFromJSON(json: any): CreateLevelDto {
    return CreateLevelDtoFromJSONTyped(json, false);
}

export function CreateLevelDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): CreateLevelDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': json['name'],
        'data': ((json['data'] as Array<any>).map(ElementFromJSON)),
    };
}

export function CreateLevelDtoToJSON(value?: CreateLevelDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'data': ((value.data as Array<any>).map(ElementToJSON)),
    };
}

