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
 * @interface Element
 */
export interface Element {
    /**
     * 
     * @type {string}
     * @memberof Element
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof Element
     */
    type: ElementTypeEnum;
    /**
     * 
     * @type {object}
     * @memberof Element
     */
    properties: object;
    /**
     * 
     * @type {boolean}
     * @memberof Element
     */
    isLocked?: boolean;
}


/**
 * @export
 */
export const ElementTypeEnum = {
    Wall: 'wall',
    WallDoor: 'wall_door',
    DoorOpener: 'door_opener',
    Arch: 'arch',
    Bounce: 'bounce',
    EndLevel: 'end_level',
    FatColumn: 'fat_column'
} as const;
export type ElementTypeEnum = typeof ElementTypeEnum[keyof typeof ElementTypeEnum];


/**
 * Check if a given object implements the Element interface.
 */
export function instanceOfElement(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "type" in value;
    isInstance = isInstance && "properties" in value;

    return isInstance;
}

export function ElementFromJSON(json: any): Element {
    return ElementFromJSONTyped(json, false);
}

export function ElementFromJSONTyped(json: any, ignoreDiscriminator: boolean): Element {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': json['name'],
        'type': json['type'],
        'properties': json['properties'],
        'isLocked': !exists(json, 'isLocked') ? undefined : json['isLocked'],
    };
}

export function ElementToJSON(value?: Element | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'type': value.type,
        'properties': value.properties,
        'isLocked': value.isLocked,
    };
}

