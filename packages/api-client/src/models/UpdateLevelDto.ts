/* tslint:disable */
/* eslint-disable */
/**
 * Composite API
 * Composite the game API
 *
 * The version of the OpenAPI document: 1.0.0-next.2
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
 * @interface UpdateLevelDto
 */
export interface UpdateLevelDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateLevelDto
     */
    name?: string;
    /**
     * 
     * @type {Array<Element>}
     * @memberof UpdateLevelDto
     */
    data?: Array<Element>;
    /**
     * 
     * @type {string}
     * @memberof UpdateLevelDto
     */
    status?: UpdateLevelDtoStatusEnum;
}


/**
 * @export
 */
export const UpdateLevelDtoStatusEnum = {
    Draft: 'DRAFT',
    Published: 'PUBLISHED'
} as const;
export type UpdateLevelDtoStatusEnum = typeof UpdateLevelDtoStatusEnum[keyof typeof UpdateLevelDtoStatusEnum];


/**
 * Check if a given object implements the UpdateLevelDto interface.
 */
export function instanceOfUpdateLevelDto(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function UpdateLevelDtoFromJSON(json: any): UpdateLevelDto {
    return UpdateLevelDtoFromJSONTyped(json, false);
}

export function UpdateLevelDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateLevelDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': !exists(json, 'name') ? undefined : json['name'],
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(ElementFromJSON)),
        'status': !exists(json, 'status') ? undefined : json['status'],
    };
}

export function UpdateLevelDtoToJSON(value?: UpdateLevelDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(ElementToJSON)),
        'status': value.status,
    };
}

