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
import type { Level } from './Level';
import {
    LevelFromJSON,
    LevelFromJSONTyped,
    LevelToJSON,
} from './Level';
import type { Player } from './Player';
import {
    PlayerFromJSON,
    PlayerFromJSONTyped,
    PlayerToJSON,
} from './Player';

/**
 * 
 * @export
 * @interface Game
 */
export interface Game {
    /**
     * 
     * @type {number}
     * @memberof Game
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof Game
     */
    status: GameStatusEnum;
    /**
     * 
     * @type {number}
     * @memberof Game
     */
    duration: number;
    /**
     * 
     * @type {string}
     * @memberof Game
     */
    region: string;
    /**
     * 
     * @type {number}
     * @memberof Game
     */
    startTime: number;
    /**
     * 
     * @type {string}
     * @memberof Game
     */
    mode: GameModeEnum;
    /**
     * 
     * @type {string}
     * @memberof Game
     */
    device: GameDeviceEnum;
    /**
     * 
     * @type {number}
     * @memberof Game
     */
    levelId: number;
    /**
     * 
     * @type {string}
     * @memberof Game
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof Game
     */
    updatedAt: string;
    /**
     * 
     * @type {string}
     * @memberof Game
     */
    endLevelToken?: string;
    /**
     * 
     * @type {Array<Player>}
     * @memberof Game
     */
    players?: Array<Player>;
    /**
     * 
     * @type {Level}
     * @memberof Game
     */
    level?: Level;
}


/**
 * @export
 */
export const GameStatusEnum = {
    Started: 'STARTED',
    Finished: 'FINISHED'
} as const;
export type GameStatusEnum = typeof GameStatusEnum[keyof typeof GameStatusEnum];

/**
 * @export
 */
export const GameModeEnum = {
    SinglePlayer: 'SINGLE_PLAYER',
    MultiPlayer: 'MULTI_PLAYER'
} as const;
export type GameModeEnum = typeof GameModeEnum[keyof typeof GameModeEnum];

/**
 * @export
 */
export const GameDeviceEnum = {
    Desktop: 'DESKTOP',
    Mobile: 'MOBILE'
} as const;
export type GameDeviceEnum = typeof GameDeviceEnum[keyof typeof GameDeviceEnum];


/**
 * Check if a given object implements the Game interface.
 */
export function instanceOfGame(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "id" in value;
    isInstance = isInstance && "status" in value;
    isInstance = isInstance && "duration" in value;
    isInstance = isInstance && "region" in value;
    isInstance = isInstance && "startTime" in value;
    isInstance = isInstance && "mode" in value;
    isInstance = isInstance && "device" in value;
    isInstance = isInstance && "levelId" in value;
    isInstance = isInstance && "createdAt" in value;
    isInstance = isInstance && "updatedAt" in value;

    return isInstance;
}

export function GameFromJSON(json: any): Game {
    return GameFromJSONTyped(json, false);
}

export function GameFromJSONTyped(json: any, ignoreDiscriminator: boolean): Game {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'status': json['status'],
        'duration': json['duration'],
        'region': json['region'],
        'startTime': json['startTime'],
        'mode': json['mode'],
        'device': json['device'],
        'levelId': json['levelId'],
        'createdAt': json['createdAt'],
        'updatedAt': json['updatedAt'],
        'endLevelToken': !exists(json, 'endLevelToken') ? undefined : json['endLevelToken'],
        'players': !exists(json, 'players') ? undefined : ((json['players'] as Array<any>).map(PlayerFromJSON)),
        'level': !exists(json, 'level') ? undefined : LevelFromJSON(json['level']),
    };
}

export function GameToJSON(value?: Game | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'status': value.status,
        'duration': value.duration,
        'region': value.region,
        'startTime': value.startTime,
        'mode': value.mode,
        'device': value.device,
        'levelId': value.levelId,
        'createdAt': value.createdAt,
        'updatedAt': value.updatedAt,
        'endLevelToken': value.endLevelToken,
        'players': value.players === undefined ? undefined : ((value.players as Array<any>).map(PlayerToJSON)),
        'level': LevelToJSON(value.level),
    };
}

