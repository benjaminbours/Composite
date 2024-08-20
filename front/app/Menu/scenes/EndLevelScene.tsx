// vendors
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { CopyToClipBoardButton } from '../CopyToClipboardButton';
import { MenuScene, Route } from '../../types';
import { UpsertRatingDtoTypeEnum } from '@benjaminbours/composite-core-api-client';
import GamesIcon from '@mui/icons-material/Games';
import { DiscordButton } from '../../02_molecules/DiscordButton';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import Link from 'next/link';
import { getDictionary } from '../../../getDictionary';
import { LevelRating } from './LevelRating';
import { servicesContainer } from '../../core/frameworks';
import { CoreApiClient } from '../../core/services';
import { generateErrorNotification } from '../../utils/errors/generateErrorNotification';
import { useSnackbar } from 'notistack';
import { useStoreState } from '../../hooks/store';
import { AuthModal } from '../../03_organisms/AuthModal';
import { labelsDifficulty, labelsOverall } from '../../constants';
import { DifficultyIcon } from '../../01_atoms/DifficultyIcon';
import { GameMode } from '../../core/entities/LobbyParameters';
import { useGlobalContext, useMenuTransitionContext } from '../../contexts';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

// TODO: If this view have a scroll, the layout with the shadow / light center on the button is broken
export const EndLevelScene: React.FC<Props> = React.memo(({ dictionary }) => {
    const {
        menuScene,
        nextMenuScene,
        endLevelRef,
        // setLightIsPulsingFast,
        // setShadowRotationSpeed,
        // setCurveIsFast,
        goToLobby,
    } = useMenuTransitionContext();
    const { gameData, gameStats, exitLobby } = useGlobalContext();

    const isAuthenticated = useStoreState(
        (actions) => actions.user.isAuthenticated,
    );

    const { enqueueSnackbar } = useSnackbar();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [ratings, setRatings] = useState<
        {
            title: string;
            labels: any;
            type: UpsertRatingDtoTypeEnum;
            value: number | null;
            hover: number;
        }[]
    >([
        {
            title: 'Level quality',
            type: UpsertRatingDtoTypeEnum.Quality,
            labels: labelsOverall,
            value: null,
            hover: -1,
        },
        {
            title: 'Feeling about the difficulty',
            type: UpsertRatingDtoTypeEnum.Difficulty,
            labels: labelsDifficulty,
            value: null,
            hover: -1,
        },
    ]);

    // const color = state.you.side === Side.SHADOW ? 'black' : 'white';

    const isMount = useMemo(
        () =>
            Boolean(
                (menuScene === MenuScene.END_LEVEL ||
                    nextMenuScene === MenuScene.END_LEVEL) &&
                    gameData &&
                    gameStats,
            ),
        [menuScene, nextMenuScene, gameData, gameStats],
    );

    const cssClass = useMemo(() => {
        return classNames({
            'end-level-scene': true,
            // [`end-level-scene--${color}`]:
            //     state.you.side !== undefined ? true : false,
            unmount: !isMount,
        });
    }, [isMount]);

    const getRatings = useCallback(() => {
        setIsUpdating(true);
        const apiClient = servicesContainer.get(CoreApiClient);
        apiClient.defaultApi
            .levelsControllerGetRatings({
                id: String(gameData?.level.id),
            })
            .then((ratings) => {
                setRatings((prev) => {
                    return prev.map((rating) => {
                        const foundRating = ratings.find(
                            (r) => r.type === rating.type,
                        );
                        return {
                            ...rating,
                            ...foundRating,
                            hover: -1,
                        };
                    });
                });
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
    }, [enqueueSnackbar, gameData, dictionary.common]);

    const upsertRating = useCallback(
        (type: UpsertRatingDtoTypeEnum, rating: number) => {
            setIsUpdating(true);
            const apiClient = servicesContainer.get(CoreApiClient);
            apiClient.defaultApi
                .levelsControllerUpsertRating({
                    id: String(gameData?.level.id),
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
        [enqueueSnackbar, gameData, dictionary.common],
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
                <button className="composite-button white" onClick={exitLobby}>
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
                                <b>{gameData?.level.name || 'Level name'}</b>
                                <br /> made by:{' '}
                                <b>
                                    {gameData?.level.author?.name ||
                                        'Author name'}
                                </b>
                                <br />
                                You did it in:{' '}
                                <b>{gameStats?.duration.toFixed(3)}</b>
                                {gameData?.lobbyParameters.mode ===
                                    GameMode.RANKED && (
                                    <>
                                        <br />
                                        This time ranks you at the position:{' '}
                                        <b>{gameStats?.rank}</b>
                                    </>
                                )}
                            </span>
                            <br />
                        </p>
                        {/* {state.mate && (
                            <p>
                                <span>
                                    You made it with your mate:{` `}
                                    <b>{state.mate.account?.name || 'Guest'}</b>
                                </span>
                            </p>
                        )} */}
                        <Link
                            className="composite-button"
                            href={Route.COMMUNITY_LEVEL(
                                gameData?.level?.id || 1,
                            )}
                        >
                            Leaderboard
                            <LeaderboardIcon className="composite-button__end-icon" />
                        </Link>
                    </div>
                    <div className="end-level-scene__feedback-container">
                        <h3 className="title-h3">We value your feedback</h3>
                        {gameData?.level && (
                            <>
                                {ratings.map((rating, index) => {
                                    return (
                                        <div key={index}>
                                            <h4 className="title-h4">
                                                {rating.title}
                                            </h4>
                                            <LevelRating
                                                className={
                                                    rating.type ===
                                                    UpsertRatingDtoTypeEnum.Difficulty
                                                        ? 'end-level-scene__difficulty-rating'
                                                        : ''
                                                }
                                                labels={rating.labels}
                                                hover={rating.hover}
                                                rating={rating.value}
                                                onHover={handleRatingHover(
                                                    rating.type,
                                                )}
                                                onChange={handleRatingChange(
                                                    rating.type,
                                                )}
                                                isUpdating={isUpdating}
                                                icon={
                                                    rating.type ===
                                                    UpsertRatingDtoTypeEnum.Difficulty ? (
                                                        <DifficultyIcon />
                                                    ) : undefined
                                                }
                                            />
                                        </div>
                                    );
                                })}
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
                            </a>{' '}
                            {/* <br /> */}
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
                        {/* <a
                            className="twitter-share-button"
                            target="_blank"
                            data-size="large"
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                `I just finished the level ${gameData?.level.name} playing ${
                                    state.you.side === Side.LIGHT
                                        ? 'Light'
                                        : 'Shadow'
                                } on Composite the game! Did you try it? ${process.env.NEXT_PUBLIC_URL}${Route.SHARE(state.loadedLevel?.id)}`,
                            )}`}
                        >
                            Tweet
                        </a> */}
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
                            // onMouseEnter={() => {
                            //     if (state.you.side === Side.LIGHT) {
                            //         setLightIsPulsingFast(true);
                            //     } else {
                            //         setShadowRotationSpeed(0.02);
                            //     }
                            // }}
                            // onMouseLeave={() => {
                            //     if (state.you.side === Side.LIGHT) {
                            //         setLightIsPulsingFast(false);
                            //     } else {
                            //         setShadowRotationSpeed(0.005);
                            //     }
                            // }}
                            onClick={() => {
                                // if (state.you.side === Side.LIGHT) {
                                //     setLightIsPulsingFast(false);
                                // } else {
                                //     setShadowRotationSpeed(0.005);
                                // }
                                goToLobby();
                            }}
                        >
                            Play again <GamesIcon />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
});
EndLevelScene.displayName = 'EndLevelScene';
