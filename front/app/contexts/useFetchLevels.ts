import {
    Level,
    LevelStatusEnum,
    UpsertRatingDtoTypeEnum,
} from '@benjaminbours/composite-core-api-client';
import { useState, useCallback, useEffect } from 'react';
import { servicesContainer } from '../core/frameworks';
import { CoreApiClient } from '../core/services';
import { computeLevelRatings } from '../utils/game';

export function useFetchLevels() {
    const [levels, setLevels] = useState<Level[]>([]);
    const [isLoadingLevels, setIsLoadingLevels] = useState(false);

    const fetchLevels = useCallback(async () => {
        const apiClient = servicesContainer.get(CoreApiClient);
        return apiClient.defaultApi
            .levelsControllerFindAll({
                status: LevelStatusEnum.Published,
                stats: 'true',
            })
            .then((levels) => {
                return levels
                    .map((level) => {
                        const ratings = computeLevelRatings(level);
                        const qualityRating = ratings.find(
                            (rating) =>
                                rating.type === UpsertRatingDtoTypeEnum.Quality,
                        );
                        const difficultyRating = ratings.find(
                            (rating) =>
                                rating.type ===
                                UpsertRatingDtoTypeEnum.Difficulty,
                        );
                        return {
                            ...level,
                            qualityRating: qualityRating
                                ? qualityRating.total / qualityRating.length
                                : 0,
                            difficultyRating: difficultyRating
                                ? difficultyRating.total /
                                  difficultyRating.length
                                : 0,
                        };
                    })
                    .sort((a, b) => {
                        return a.difficultyRating - b.difficultyRating;
                    });
            });
    }, []);

    useEffect(() => {
        setIsLoadingLevels(true);
        fetchLevels()
            .then((levels) => {
                setLevels(levels);
            })
            .finally(() => {
                setIsLoadingLevels(false);
            });
    }, [fetchLevels]);

    return {
        levels,
        isLoadingLevels,
    };
}
