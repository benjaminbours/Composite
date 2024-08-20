import { Region } from '@hathora/cloud-sdk-typescript/models/components';

export const MAIL_REGEXP =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const labelsOverall: { [index: string]: string } = {
    0.5: 'Terrible',
    1: 'Very Poor',
    1.5: 'Poor',
    2: 'Subpar',
    2.5: 'Fair',
    3: 'Average',
    3.5: 'Good',
    4: 'Very Good',
    4.5: 'Excellent',
    5: 'Outstanding',
};

export const labelsDifficulty: { [index: string]: string } = {
    0.5: 'Beginner',
    1: 'Very Easy',
    1.5: 'Easy',
    2: 'Moderate',
    2.5: 'Normal',
    3: 'Challenging',
    3.5: 'Hard',
    4: 'Very Hard',
    4.5: 'Expert',
    5: 'Master',
};

export const defaultLevelImageUrl = '/images/crack_the_door.png';

export const hideInGameHelpModalKey = 'hide-game-help-modal';
export function getShouldDisplayHelpOnLoad(): boolean {
    if (global.window) {
        if (window.localStorage.getItem(hideInGameHelpModalKey) === '1') {
            return false;
        }
    }
    return true;
}

export const FLAG_MAP: Record<Region, string> = {
    Dallas: '🇺🇸',
    Chicago: '🇺🇸',
    Seattle: '🇺🇸',
    Los_Angeles: '🇺🇸',
    Washington_DC: '🇺🇸',
    London: '🇬🇧',
    Frankfurt: '🇩🇪',
    Sao_Paulo: '🇧🇷',
    Mumbai: '🇮🇳',
    Singapore: '🇸🇬',
    Tokyo: '🇯🇵',
    Sydney: '🇦🇺',
};
