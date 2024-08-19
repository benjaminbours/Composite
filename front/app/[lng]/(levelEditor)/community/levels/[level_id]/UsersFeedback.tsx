'use client';
import {
    Level,
    UpsertRatingDtoTypeEnum,
} from '@benjaminbours/composite-core-api-client';
import React, { useMemo } from 'react';
import { LevelRating } from '../../../../../Menu/scenes/LevelRating';
import { DifficultyIcon } from '../../../../../01_atoms/DifficultyIcon';
import { computeLevelRatings } from '../../../../../utils/game';

interface Props {
    level: Level;
}

export const UsersFeedback: React.FC<Props> = ({ level }) => {
    const ratings = useMemo(() => computeLevelRatings(level), [level]);

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
                            rating={rating.total / rating.length}
                            icon={
                                rating.type ===
                                UpsertRatingDtoTypeEnum.Difficulty ? (
                                    <DifficultyIcon />
                                ) : undefined
                            }
                        />
                        <p>
                            {rating.length} vote{rating.length > 1 ? 's' : ''}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};
