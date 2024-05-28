// vendors
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { CopyToClipBoardButton } from '../CopyToClipboardButton';
import { Route } from '../../types';
import {
    Level,
    UpsertRatingDtoTypeEnum,
} from '@benjaminbours/composite-api-client';
import GamesIcon from '@mui/icons-material/Games';
import { PlayerState } from '../../useMainController';
import { DiscordButton } from '../../02_molecules/DiscordButton';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import Link from 'next/link';
import { getDictionary } from '../../../getDictionary';
import { LevelRating } from './LevelRating';
import { servicesContainer } from '../../core/frameworks';
import { ApiClient } from '../../core/services';
import { generateErrorNotification } from '../../utils/errors/generateErrorNotification';
import { useSnackbar } from 'notistack';
import { useStoreState } from '../../hooks/store';
import { AuthModal } from '../../03_organisms/AuthModal';

const DifficultyIcon = () => {
    return (
        <svg fill="#000000" viewBox="0 -8 72 72">
            <path d="M48.47,22.7A10.73,10.73,0,0,0,50.12,17c0-4.51-1.56-8.35-5.6-10.7C39.75,3.48,34.67,3.31,29.47,5,21.4,7.59,19.27,17.19,23,22.81a6.1,6.1,0,0,1,.83,2.09,3.65,3.65,0,0,1-.33,1.39,4.83,4.83,0,0,0-.39,1.64,3,3,0,0,0,3.06,2.67c1.94.1,2.35.5,2.48,2.37a.77.77,0,0,0,.5.52,9.7,9.7,0,0,0,2,.12c.68,0,1,.17,1.08.84a.81.81,0,0,0,.48.56,11.63,11.63,0,0,0,1.66-.09c0-.46.05-.83.08-1.23H37c0,.46.05.85.08,1.26L39,35a3,3,0,0,0,.12-.48c.06-.77.46-1,1.23-1a12.88,12.88,0,0,0,1.85-.09c.43,0,.65-.2.58-.66-.26-1.69.92-2.15,2.14-2.27a5.18,5.18,0,0,0,1.92-.49,2.72,2.72,0,0,0,.93-4,1.8,1.8,0,0,1-.2-1.35A8.12,8.12,0,0,1,48.47,22.7Zm-17.2,1.38a5,5,0,0,1-4.54-.52c-1.68-1.25-1.65-4.5.12-5.63A4,4,0,0,1,29,17.37a10.26,10.26,0,0,1,3.39.64A2.37,2.37,0,0,1,34,20.92,3.55,3.55,0,0,1,31.27,24.08Zm6.79,4.63a1.12,1.12,0,0,1-1.45.1,1.52,1.52,0,0,0-2,0,1.56,1.56,0,0,1-1.38-.09A1.3,1.3,0,0,1,33,27.5a28.71,28.71,0,0,1,1.73-3.41c.13-.23.58-.28.89-.41l0,.15c.66-.23,1,.18,1.24.67s.7,1.21,1,1.84a3.48,3.48,0,0,1,.44,1.17A1.76,1.76,0,0,1,38.06,28.71Zm7.37-6.18c-.71,1.42-2,1.81-3.61,1.88-1.38-.18-2.92-.28-3.78-1.7a6.09,6.09,0,0,1-.77-2.29,2.13,2.13,0,0,1,1.25-2.22,7.83,7.83,0,0,1,5.21-.62,2.21,2.21,0,0,1,1.24.86A3.81,3.81,0,0,1,45.43,22.53Z" />
            <path d="M16.29,45.72a2.9,2.9,0,0,1,1.28-2.78,2.83,2.83,0,0,1,4.16,1.44l4.7-1.7,17.7-6.46,4.7-1.7a2.85,2.85,0,0,1,2.29-3.79A2.88,2.88,0,0,1,53.9,32a2.67,2.67,0,0,1,.37,2.08,1,1,0,0,0,.43,1.12,2.82,2.82,0,1,1-4.43,3.15l-4.75,1.76L27.81,46.57l-4.69,1.71a2.84,2.84,0,0,1-2.29,3.78,2.88,2.88,0,0,1-2.78-1.28,2.67,2.67,0,0,1-.37-2.08,1,1,0,0,0-.43-1.12A3,3,0,0,1,16.29,45.72Z" />
            <path d="M54.38,43a2.83,2.83,0,0,0-4.16,1.44l-7.1-2.62L37,44l11.74,4.27a2.84,2.84,0,0,0,5.06,2.5,2.63,2.63,0,0,0,.38-2.08,1,1,0,0,1,.42-1.12,2.78,2.78,0,0,0,1-1.81A2.69,2.69,0,0,0,54.38,43Z" />
            <path d="M17.57,39.85a2.83,2.83,0,0,0,4.16-1.44L28.83,41l6.08-2.18L23.17,34.57a2.85,2.85,0,0,0-2.29-3.79,2.88,2.88,0,0,0-2.77,1.28,2.64,2.64,0,0,0-.38,2.08,1,1,0,0,1-.42,1.12,2.83,2.83,0,0,0-1,1.82A2.74,2.74,0,0,0,17.57,39.85Z" />
        </svg>
    );
};

const labelsOverall: { [index: string]: string } = {
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

const labelsDifficulty: { [index: string]: string } = {
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

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    endLevelRef: React.RefObject<HTMLDivElement>;
    level?: Level;
    side?: Side;
    mate?: PlayerState;
    handleClickOnPlay: () => void;
    handleClickOnExit: () => void;
    isMount: boolean;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
}

// TODO: If this view have a scroll, the layout with the shadow / light center on the button is broken
export const EndLevelScene: React.FC<Props> = ({
    dictionary,
    endLevelRef,
    side,
    mate,
    level,
    handleClickOnPlay,
    handleClickOnExit,
    isMount,
    setLightIsPulsingFast,
    setShadowRotationSpeed,
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [ratings, setRatings] = useState<
        { type: UpsertRatingDtoTypeEnum; value: number | null; hover: number }[]
    >([
        {
            type: UpsertRatingDtoTypeEnum.Quality,
            value: null,
            hover: -1,
        },
        {
            type: UpsertRatingDtoTypeEnum.Difficulty,
            value: null,
            hover: -1,
        },
    ]);
    const isAuthenticated = useStoreState(
        (actions) => actions.user.isAuthenticated,
    );

    const color = side === Side.SHADOW ? 'black' : 'white';
    const cssClass = classNames({
        'end-level-scene': true,
        [`end-level-scene--${color}`]: side !== undefined ? true : false,
        unmount: !isMount,
    });

    const getRatings = useCallback(() => {
        if (!level) {
            return;
        }
        setIsUpdating(true);
        const apiClient = servicesContainer.get(ApiClient);
        apiClient.defaultApi
            .levelsControllerGetRatings({
                id: String(level.id),
            })
            .then((ratings) => {
                setRatings(ratings.map((rating) => ({ ...rating, hover: -1 })));
            })
            .catch(async (error) => {
                console.error(error);
                const errorData = await error.response.json();
                enqueueSnackbar(
                    generateErrorNotification(errorData, dictionary.common),
                    {
                        variant: 'error',
                    },
                );
            })
            .finally(() => {
                setIsUpdating(false);
            });
    }, [enqueueSnackbar, level, dictionary.common]);

    const upsertRating = useCallback(
        (type: UpsertRatingDtoTypeEnum, rating: number) => {
            if (!level) {
                return;
            }
            setIsUpdating(true);
            const apiClient = servicesContainer.get(ApiClient);
            apiClient.defaultApi
                .levelsControllerUpsertRating({
                    id: String(level.id),
                    upsertRatingDto: {
                        rating,
                        type,
                    },
                })
                .then((updatedRating) => {
                    setRatings((prev) => {
                        return prev.map((rating) => {
                            if (rating.type === type) {
                                return {
                                    ...rating,
                                    value: updatedRating.value,
                                };
                            }
                            return rating;
                        });
                    });
                    enqueueSnackbar(
                        'Successfully saved your rating! Thank you 🙏',
                        {
                            variant: 'success',
                        },
                    );
                })
                .catch(async (error) => {
                    console.error(error);
                    const errorData = await error.response.json();
                    enqueueSnackbar(
                        generateErrorNotification(errorData, dictionary.common),
                        {
                            variant: 'error',
                        },
                    );
                })
                .finally(() => {
                    setIsUpdating(false);
                });
        },
        [enqueueSnackbar, level, dictionary.common],
    );

    const handleRatingHover = useCallback(
        (type: UpsertRatingDtoTypeEnum) => (nextValue: number) => {
            setRatings((prev) => {
                return prev.map((rating) => {
                    if (rating.type === type) {
                        return { ...rating, hover: nextValue };
                    }
                    return rating;
                });
            });
        },
        [],
    );

    const handleRatingChange = useCallback(
        (type: UpsertRatingDtoTypeEnum) => (nextValue: number) => {
            if (!isAuthenticated) {
                setIsAuthModalOpen(true);
                return;
            }

            upsertRating(type, nextValue);
        },
        [isAuthenticated, upsertRating],
    );

    useEffect(() => {
        if (isAuthenticated && isAuthModalOpen) {
            setIsAuthModalOpen(false);
        }
    }, [isAuthenticated, isAuthModalOpen]);

    useEffect(() => {
        if (!isMount) {
            return;
        }

        if (isAuthenticated) {
            getRatings();
        }

        (window as any).twttr = (function (d, s, id) {
            var js: any,
                fjs: any = d.getElementsByTagName(s)[0],
                t = (window as any).twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = 'https://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function (f: any) {
                t._e.push(f);
            };

            return t;
        })(document, 'script', 'twitter-wjs');
    }, [isMount, getRatings, isAuthenticated]);

    return (
        <div ref={endLevelRef} className={cssClass}>
            <AuthModal
                setIsModalOpen={setIsAuthModalOpen}
                isModalOpen={isAuthModalOpen}
                dictionary={dictionary.common}
                text="Login to your account to save your feedback."
            />
            <div className="end-level-scene__header">
                <button
                    className="composite-button white"
                    onClick={handleClickOnExit}
                >
                    Exit
                </button>
            </div>
            <div className="main-container">
                <h2 className="title-h2 end-level-scene__main-title">
                    Well done!
                </h2>
                <section className="end-level-scene__debrief-section">
                    <div className="end-level-scene__run-info-container">
                        <h3 className="title-h3">Run details</h3>
                        <p>
                            <span>
                                Level:{` `}
                                <b>{level?.name || 'Level name'}</b>
                                <br /> made by:{' '}
                                <b>{level?.author?.name || 'Author name'}</b>
                                <br />
                                You did it in: <b>00:00</b>
                                <br />
                                This time ranks you at the position: <b>0</b>
                            </span>
                            <br />
                        </p>
                        {mate && (
                            <p>
                                <span>
                                    You made it with your mate:{` `}
                                    <b>{mate.account?.name || 'Guest'}</b>
                                </span>
                            </p>
                        )}
                        <Link
                            className="composite-button"
                            href={Route.COMMUNITY_LEVEL(level?.id || 1)}
                        >
                            Leaderboard
                            <LeaderboardIcon className="composite-button__end-icon" />
                        </Link>
                    </div>
                    <div className="end-level-scene__feedback-container">
                        <h3 className="title-h3">We value your feedback</h3>
                        {level && (
                            <>
                                <h4 className="title-h4">Level quality</h4>
                                <LevelRating
                                    dictionary={dictionary}
                                    labels={labelsOverall}
                                    hover={
                                        ratings.find(
                                            (r) =>
                                                r.type ===
                                                UpsertRatingDtoTypeEnum.Quality,
                                        )!.hover
                                    }
                                    rating={
                                        ratings.find(
                                            (r) =>
                                                r.type ===
                                                UpsertRatingDtoTypeEnum.Quality,
                                        )!.value
                                    }
                                    onHover={handleRatingHover(
                                        UpsertRatingDtoTypeEnum.Quality,
                                    )}
                                    onChange={handleRatingChange(
                                        UpsertRatingDtoTypeEnum.Quality,
                                    )}
                                    isUpdating={isUpdating}
                                />
                                <h4 className="title-h4">
                                    Feeling about the difficulty
                                </h4>
                                <LevelRating
                                    className="end-level-scene__difficulty-rating"
                                    dictionary={dictionary}
                                    labels={labelsDifficulty}
                                    hover={
                                        ratings.find(
                                            (r) =>
                                                r.type ===
                                                UpsertRatingDtoTypeEnum.Difficulty,
                                        )!.hover
                                    }
                                    rating={
                                        ratings.find(
                                            (r) =>
                                                r.type ===
                                                UpsertRatingDtoTypeEnum.Difficulty,
                                        )!.value
                                    }
                                    onHover={handleRatingHover(
                                        UpsertRatingDtoTypeEnum.Difficulty,
                                    )}
                                    onChange={handleRatingChange(
                                        UpsertRatingDtoTypeEnum.Difficulty,
                                    )}
                                    isUpdating={isUpdating}
                                    icon={<DifficultyIcon />}
                                />
                            </>
                        )}
                    </div>
                </section>
                <section className="end-level-scene__socials-section">
                    <div className="end-level-scene__text-container">
                        <p>
                            <span>
                                If you liked the experience and you want it to
                                reach its{' '}
                            </span>
                            <a
                                className="inline-link"
                                href={Route.ROADMAP}
                                target="_blank"
                            >
                                full&nbsp;potential
                            </a>
                            <br />
                            <span>
                                the best thing you can do is to talk about it.
                            </span>
                        </p>
                        <CopyToClipBoardButton
                            text={'Share the project'}
                            textToCopy={
                                process.env.NEXT_PUBLIC_URL ||
                                'Missing env variable'
                            }
                        />
                        <div className="thank-you">
                            <h2 className="title-h2">Thank you</h2>
                            <span className="thank-emoji">🙏</span>
                        </div>
                    </div>
                    <div className="end-level-scene__socials-container">
                        <a
                            className="twitter-share-button"
                            target="_blank"
                            data-size="large"
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                `I just finished the level ${level?.name} playing ${
                                    side === Side.LIGHT ? 'Light' : 'Shadow'
                                } on Composite the game! Did you try it? ${process.env.NEXT_PUBLIC_URL}${Route.SHARE(level?.id)}`,
                            )}`}
                        >
                            Tweet
                        </a>
                        <a
                            className="composite-button end-level-scene__patreon-button"
                            href="https://patreon.com/benjaminbours"
                            target="_blank"
                        >
                            Support me
                            <svg viewBox="0 0 1080 1080">
                                <path
                                    d="M1033.05,324.45c-0.19-137.9-107.59-250.92-233.6-291.7c-156.48-50.64-362.86-43.3-512.28,27.2
	C106.07,145.41,49.18,332.61,47.06,519.31c-1.74,153.5,13.58,557.79,241.62,560.67c169.44,2.15,194.67-216.18,273.07-321.33
	c55.78-74.81,127.6-95.94,216.01-117.82C929.71,603.22,1033.27,483.3,1033.05,324.45z"
                                />
                            </svg>
                        </a>
                        <DiscordButton className="composite-button" />
                        <button
                            className="composite-button end-level-scene__play-button main-action"
                            onMouseEnter={() => {
                                if (side === Side.LIGHT) {
                                    setLightIsPulsingFast(true);
                                } else {
                                    setShadowRotationSpeed(0.02);
                                }
                            }}
                            onMouseLeave={() => {
                                if (side === Side.LIGHT) {
                                    setLightIsPulsingFast(false);
                                } else {
                                    setShadowRotationSpeed(0.005);
                                }
                            }}
                            onClick={() => {
                                if (side === Side.LIGHT) {
                                    setLightIsPulsingFast(false);
                                } else {
                                    setShadowRotationSpeed(0.005);
                                }
                                handleClickOnPlay();
                            }}
                        >
                            Play again <GamesIcon />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
