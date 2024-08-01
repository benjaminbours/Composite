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
import type { Game } from './Game';
import {
    GameFromJSON,
    GameFromJSONTyped,
    GameToJSON,
} from './Game';

/**
 * 
 * @export
 * @interface FinishGameResponse
 */
export interface FinishGameResponse {
    /**
     * 
     * @type {Game}
     * @memberof FinishGameResponse
     */
    updatedGame: Game;
    /**
     * 
     * @type {number}
     * @memberof FinishGameResponse
     */
    rank: number;
}

/**
 * Check if a given object implements the FinishGameResponse interface.
 */
export function instanceOfFinishGameResponse(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "updatedGame" in value;
    isInstance = isInstance && "rank" in value;

    return isInstance;
}

export function FinishGameResponseFromJSON(json: any): FinishGameResponse {
    return FinishGameResponseFromJSONTyped(json, false);
}

export function FinishGameResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): FinishGameResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'updatedGame': GameFromJSON(json['updatedGame']),
        'rank': json['rank'],
    };
}

export function FinishGameResponseToJSON(value?: FinishGameResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'updatedGame': GameToJSON(value.updatedGame),
        'rank': value.rank,
    };
}

