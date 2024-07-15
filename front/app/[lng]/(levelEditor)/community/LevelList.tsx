'use client';
import React, { useEffect, useState } from 'react';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import Link from 'next/link';
import { getDictionary } from '../../../../getDictionary';
import {
    Level,
    LevelStatusEnum,
    UpsertRatingDtoTypeEnum,
} from '@benjaminbours/composite-api-client';
import CircularProgress from '@mui/material/CircularProgress';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StarIcon from '@mui/icons-material/Star';
import { ConfirmDialogContextProvider } from '../../../contexts';
import { Route } from '../../../types';
import { DifficultyIcon } from '../../../01_atoms/DifficultyIcon';
import { computeRatings } from '../../../utils';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

const withConfirmDialogProvider = (Component: React.FC<Props>) => {
    const Wrapper = (props: Props) => {
        return (
            <ConfirmDialogContextProvider>
                <Component {...props} />
            </ConfirmDialogContextProvider>
        );
    };
    return Wrapper;
};

const defaultImageUrl = '/images/crack_the_door.png';

export const LevelList: React.FC<Props> = withConfirmDialogProvider(
    ({ dictionary }) => {
        const [levels, setLevels] = useState<Level[]>([]);
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            const apiClient = servicesContainer.get(ApiClient);

            apiClient.defaultApi
                .levelsControllerFindAll({ stats: 'true' })
                .then((levels) => {
                    console.log('levels', levels);
                    setLevels(levels);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, []);

        if (isLoading) {
            return (
                <div className="level-list__not-logged">
                    <CircularProgress style={{ color: 'white' }} />
                </div>
            );
        }

        return (
            <div className="level-grid">
                <ul>
                    {levels
                        .sort(
                            (a, b) =>
                                (a.count as any).games + (b.count as any).games,
                        )
                        .map((level) => {
                            const imageUrl = (() => {
                                if (level.thumbnail) {
                                    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/level_thumbnails/${level.thumbnail}`;
                                }
                                return defaultImageUrl;
                            })();

                            const ratings = computeRatings(level);
                            const qualityRating = ratings.find(
                                (rating) =>
                                    rating.type ===
                                    UpsertRatingDtoTypeEnum.Quality,
                            );
                            const difficultyRating = ratings.find(
                                (rating) =>
                                    rating.type ===
                                    UpsertRatingDtoTypeEnum.Difficulty,
                            );

                            return (
                                <li key={level.id}>
                                    <Link
                                        href={Route.COMMUNITY_LEVEL(level.id)}
                                        className="level-grid-item"
                                    >
                                        <div
                                            className="level-grid-item__image"
                                            style={{
                                                backgroundImage: `url("${imageUrl}")`,
                                            }}
                                        >
                                            <div className="level-grid-item__border-container">
                                                <div />
                                                <div />
                                                <div />
                                                <div />
                                                <div />
                                            </div>
                                        </div>
                                        <p className="level-grid-item__name">
                                            {level.name}
                                        </p>
                                        <p className="level-grid-item__name">
                                            by <b>{level.author?.name}</b>
                                        </p>
                                        <div className="level-grid-item__counts">
                                            <div title="Number of time the level has been played">
                                                <SportsEsportsIcon />{' '}
                                                {(level.count as any).games}
                                            </div>
                                            <div
                                                title="Quality rating"
                                                className="level-grid-item__quality-icon"
                                            >
                                                <StarIcon />{' '}
                                                {qualityRating
                                                    ? qualityRating.total /
                                                      qualityRating.length
                                                    : 0}
                                            </div>
                                            <div
                                                title="Difficulty rating"
                                                className="level-grid-item__difficulty-icon"
                                            >
                                                <DifficultyIcon />{' '}
                                                {difficultyRating
                                                    ? difficultyRating.total /
                                                      difficultyRating.length
                                                    : 0}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                </ul>
            </div>
        );
    },
);
