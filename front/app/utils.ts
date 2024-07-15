import {
    Level,
    UpsertRatingDtoTypeEnum,
} from '@benjaminbours/composite-api-client';
import { labelsDifficulty, labelsOverall } from './constants';

export function computeRatings(level: Level) {
    const { ratings } = level;
    if (!ratings) {
        return [];
    }

    return ratings.reduce(
        (acc, item) => {
            const existingItem = acc.find((i) => i.type === item.type);
            if (existingItem) {
                // if item already exist, just increment
                existingItem.length += 1;
                existingItem.total += item.value;
            } else {
                // create new item depending of the type
                if (item.type === UpsertRatingDtoTypeEnum.Difficulty) {
                    acc.push({
                        title: 'Difficulty',
                        type: item.type,
                        labels: labelsDifficulty,
                        length: 1,
                        total: item.value,
                    });
                }

                if (item.type === UpsertRatingDtoTypeEnum.Quality) {
                    acc.push({
                        title: 'Quality',
                        type: item.type,
                        labels: labelsOverall,
                        length: 1,
                        total: item.value,
                    });
                }
            }

            return acc;
        },
        [] as {
            title: string;
            labels: any;
            type: UpsertRatingDtoTypeEnum;
            total: number;
            length: number;
        }[],
    );
}
