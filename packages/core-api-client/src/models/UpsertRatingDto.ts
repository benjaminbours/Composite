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
 * @interface UpsertRatingDto
 */
export interface UpsertRatingDto {
    /**
     * 
     * @type {number}
     * @memberof UpsertRatingDto
     */
    rating: number;
    /**
     * 
     * @type {string}
     * @memberof UpsertRatingDto
     */
    type: UpsertRatingDtoTypeEnum;
}


/**
 * @export
 */
export const UpsertRatingDtoTypeEnum = {
    Quality: 'QUALITY',
    Difficulty: 'DIFFICULTY'
} as const;
export type UpsertRatingDtoTypeEnum = typeof UpsertRatingDtoTypeEnum[keyof typeof UpsertRatingDtoTypeEnum];


/**
 * Check if a given object implements the UpsertRatingDto interface.
 */
export function instanceOfUpsertRatingDto(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "rating" in value;
    isInstance = isInstance && "type" in value;

    return isInstance;
}

export function UpsertRatingDtoFromJSON(json: any): UpsertRatingDto {
    return UpsertRatingDtoFromJSONTyped(json, false);
}

export function UpsertRatingDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpsertRatingDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'rating': json['rating'],
        'type': json['type'],
    };
}

export function UpsertRatingDtoToJSON(value?: UpsertRatingDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'rating': value.rating,
        'type': value.type,
    };
}

