'use client';
import {
    Level,
    UpsertRatingDtoTypeEnum,
} from '@benjaminbours/composite-api-client';
import React, { useMemo } from 'react';
import { LevelRating } from '../../../../../Menu/scenes/LevelRating';
import { labelsDifficulty, labelsOverall } from '../../../../../constants';
import { DifficultyIcon } from '../../../../../01_atoms/DifficultyIcon';

interface Props {
    level: Level;
}

export const UsersFeedback: React.FC<Props> = ({ level }) => {
    const ratings = useMemo(() => {
        const { ratings } = level;
        if (!ratings) {
            return [];
        }

        const { quality, qualityLength, difficulty, difficultyLength } =
            ratings.reduce(
                (acc, item) => {
                    if (item.type === UpsertRatingDtoTypeEnum.Difficulty) {
                        acc.difficulty += item.value;
                        acc.difficultyLength += 1;
                    }

                    if (item.type === UpsertRatingDtoTypeEnum.Quality) {
                        acc.quality += item.value;
                        acc.qualityLength += 1;
                    }
                    return acc;
                },
                {
                    quality: 0,
                    difficulty: 0,
                    qualityLength: 0,
                    difficultyLength: 0,
                },
            );

        const qualityRating = quality / qualityLength;
        const difficultyRating = difficulty / difficultyLength;

        return [
            {
                title: 'Quality',
                value: qualityRating,
                type: UpsertRatingDtoTypeEnum.Quality,
                labels: labelsOverall,
                votes: qualityLength,
            },
            {
                title: 'Difficulty',
                value: difficultyRating,
                type: UpsertRatingDtoTypeEnum.Difficulty,
                labels: labelsDifficulty,
                votes: difficultyLength,
            },
        ];
    }, [level]);

    return (
        <div className="level-details-page__user-feedback">
            <h2 className="title-h2">Users feedback</h2>
            {ratings.map((rating, index) => {
                return (
                    <div
                        key={index}
                        className="level-details-page__rating-group"
                    >
                        <h4 className="title-h4">{rating.title}</h4>
                        <LevelRating
                            className={
                                rating.type ===
                                UpsertRatingDtoTypeEnum.Difficulty
                                    ? 'end-level-scene__difficulty-rating'
                                    : ''
                            }
                            labels={rating.labels}
                            hover={-1}
                            readOnly
                            rating={rating.value}
                            icon={
                                rating.type ===
                                UpsertRatingDtoTypeEnum.Difficulty ? (
                                    <DifficultyIcon />
                                ) : undefined
                            }
                        />
                        <p>
                            {rating.votes} vote{rating.votes > 1 ? 's' : ''}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};
