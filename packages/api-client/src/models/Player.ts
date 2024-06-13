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
import type { User } from './User';
import {
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
} from './User';

/**
 * 
 * @export
 * @interface Player
 */
export interface Player {
    /**
     * 
     * @type {number}
     * @memberof Player
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof Player
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof Player
     */
    updatedAt: string;
    /**
     * 
     * @type {string}
     * @memberof Player
     */
    side: PlayerSideEnum;
    /**
     * 
     * @type {number}
     * @memberof Player
     */
    userId: number;
    /**
     * 
     * @type {User}
     * @memberof Player
     */
    user?: User;
}


/**
 * @export
 */
export const PlayerSideEnum = {
    Shadow: 'SHADOW',
    Light: 'LIGHT'
} as const;
export type PlayerSideEnum = typeof PlayerSideEnum[keyof typeof PlayerSideEnum];


/**
 * Check if a given object implements the Player interface.
 */
export function instanceOfPlayer(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "createdAt" in value;
    isInstance = isInstance && "updatedAt" in value;
    isInstance = isInstance && "side" in value;
    isInstance = isInstance && "userId" in value;

    return isInstance;
}

export function PlayerFromJSON(json: any): Player {
    return PlayerFromJSONTyped(json, false);
}

export function PlayerFromJSONTyped(json: any, ignoreDiscriminator: boolean): Player {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'createdAt': json['createdAt'],
        'updatedAt': json['updatedAt'],
        'side': json['side'],
        'userId': json['userId'],
        'user': !exists(json, 'user') ? undefined : UserFromJSON(json['user']),
    };
}

export function PlayerToJSON(value?: Player | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'createdAt': value.createdAt,
        'updatedAt': value.updatedAt,
        'side': value.side,
        'userId': value.userId,
        'user': UserToJSON(value.user),
    };
}

