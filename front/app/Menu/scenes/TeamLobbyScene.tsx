// vendors
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Slider, { Settings } from 'react-slick';
import CircularProgress from '@mui/material/CircularProgress';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Side } from '@benjaminbours/composite-core';
import { Level, User } from '@benjaminbours/composite-api-client';
import { LevelPortal } from './LevelPortal';
import { CopyToClipBoardButton } from '../CopyToClipboardButton';
import { useSearchParams } from 'next/navigation';
import { servicesContainer } from '../../core/frameworks';
import { ApiClient } from '../../core/services';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../getDictionary';
import { useStoreState } from '../../hooks';
import { AuthModal } from '../../03_organisms/AuthModal';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    teamLobbyRef: React.RefObject<HTMLDivElement>;
    actions: React.ReactNode;
    isMount: boolean;
    handleSelectLevel: (levelId: number) => void;
    handleSelectSide: (side: Side) => void;
    levels: Level[];
    selectedSide: Side | undefined;
    levelSelectedByTeamMate: number | undefined;
    sideSelectedByTeamMate: Side | undefined;
    teamMate: User | 'guest' | 'disconnected' | undefined;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
    inviteFriend: () => Promise<string>;
    handleEnterTeamLobby: (inviteFriendToken: string) => void;
}

// TODO: Wrap all scenes with react.memo to prevent useless re-render
export const TeamLobbyScene: React.FC<Props> = React.memo(
    ({
        teamLobbyRef,
        dictionary,
        actions,
        isMount,
        levels,
        selectedSide,
        levelSelectedByTeamMate,
        sideSelectedByTeamMate,
        teamMate,
        handleSelectLevel,
        handleSelectSide,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        inviteFriend,
        handleEnterTeamLobby,
    }) => {
        const { enqueueSnackbar } = useSnackbar();
        const urlSearchParams = useSearchParams();
        const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
        const isConnecting = useRef(false);
        const currentUser = useStoreState(
            (actions) => actions.user.currentUser,
        );
        const isGuest = useStoreState((actions) => actions.user.isGuest);
        const isAuthenticated = useStoreState(
            (actions) => actions.user.isAuthenticated,
        );
        const isRetrievingSession = useStoreState(
            (actions) => actions.user.isRetrievingSession,
        );
        const sliderRef = useRef<any>(null);
        const cssClass = classNames({
            'content-container': true,
            'team-lobby-scene': true,
            unmount: !isMount,
        });

        const next = () => {
            sliderRef.current?.slickNext();
        };
        const previous = () => {
            sliderRef.current?.slickPrev();
        };

        const settings: Settings = {
            className: 'center level-slider',
            centerMode: true,
            infinite: true,
            centerPadding: '20px',
            useTransform: false,
            slidesToShow: 3,
            speed: 500,
            arrows: false,
            // waitForAnimate: false,
            beforeChange: function (currentSlide: number, nextSlide: number) {
                const level = levels[nextSlide];
                handleSelectLevel(level.id);
            },
        };

        // on mount
        useEffect(() => {
            if (!isGuest && !isAuthenticated && !isRetrievingSession) {
                setIsAuthModalOpen(true);
                return;
            }

            if (isGuest || isAuthenticated) {
                setIsAuthModalOpen(false);
            }

            const token = urlSearchParams.get('token');
            if (!token || isConnecting.current) {
                return;
            }

            isConnecting.current = true;
            const apiClient = servicesContainer.get(ApiClient);
            apiClient.defaultApi
                .appControllerCheckInviteValidity({
                    inviteToken: token,
                })
                .then(() => {
                    handleEnterTeamLobby(token);
                })
                .catch((error) => {
                    console.error(error);
                    enqueueSnackbar(
                        'The lobby you are trying to join is not valid or does not exist anymore.',
                        {
                            variant: 'error',
                        },
                    );
                })
                .finally(() => {
                    isConnecting.current = false;
                });
        }, [
            isConnecting,
            urlSearchParams,
            enqueueSnackbar,
            isRetrievingSession,
            isAuthenticated,
            isGuest,
            handleEnterTeamLobby,
        ]);

        // initial loading
        useEffect(() => {
            if (isMount) {
                handleSelectLevel(levels[0].id);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isMount]);

        const teamMateState = useMemo(() => {
            if (teamMate === undefined || teamMate === 'disconnected') {
                return (
                    <div className="team-lobby-scene__player">
                        <p className="">Waiting for mate...</p>
                        <CircularProgress
                            size={30}
                            className="team-lobby-scene__player-loading"
                        />
                    </div>
                );
            }

            return (
                <div className="team-lobby-scene__player">
                    <p>
                        <span>Mate:{` `}</span>
                        <b>{teamMate === 'guest' ? 'Guest' : teamMate.name}</b>
                    </p>
                </div>
            );
        }, [teamMate]);

        return (
            <div ref={teamLobbyRef} className={cssClass}>
                <AuthModal
                    setIsModalOpen={setIsAuthModalOpen}
                    isModalOpen={isAuthModalOpen}
                    dictionary={dictionary.common}
                    text="Login to your account or continue as guest"
                    withGuest
                />
                <div className="team-lobby-scene__header">
                    {actions}
                    <h1 className="title-h2 title-h2--white">Lobby</h1>
                </div>
                <div className="team-lobby-scene__column-left">
                    <div className="team-lobby-scene__players">
                        <h3 className="title-h4">Players</h3>
                        <Divider className="team-lobby-scene__divider" />
                        <div className="team-lobby-scene__player">
                            <p className="">
                                <span>You:{` `}</span>
                                <b>
                                    {currentUser ? currentUser.name : 'Guest'}
                                </b>
                            </p>
                            {selectedSide !== undefined && (
                                <div
                                    className={`team-lobby-scene__player-side ${selectedSide === Side.LIGHT ? 'light' : 'shadow'}`}
                                />
                            )}
                        </div>
                        {teamMateState}
                        <CopyToClipBoardButton
                            className="team-lobby-scene__player-invite"
                            text="Invite link"
                            asyncAction={inviteFriend}
                        />
                    </div>
                </div>
                <div className="team-lobby-scene__column-right">
                    <div className="team-lobby-scene__level-container">
                        <h2 className="title-h3 title-h3--white">
                            Select a level
                        </h2>
                        <Slider ref={sliderRef} {...settings}>
                            {levels.map(({ id, name }) => {
                                return (
                                    <LevelPortal
                                        name={name}
                                        key={id}
                                        isSelectedByTeamMate={
                                            id === levelSelectedByTeamMate
                                        }
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/thumbnails/level_${id}_thumbnail.png`}
                                    />
                                );
                            })}
                        </Slider>
                        <div className="team-lobby-scene__slider-arrows">
                            <IconButton onClick={previous}>
                                <ArrowBackIosNewIcon />
                            </IconButton>
                            <IconButton onClick={next}>
                                <ArrowForwardIosIcon />
                            </IconButton>
                        </div>
                    </div>
                    <div className="team-lobby-scene__side-container">
                        <h2 className="title-h3 title-h3--white">
                            Select your side
                        </h2>
                        {sideSelectedByTeamMate !== Side.LIGHT &&
                        selectedSide !== Side.LIGHT ? (
                            <button
                                className="team-lobby-scene__side-button"
                                onMouseEnter={() => setLightIsPulsingFast(true)}
                                onMouseLeave={() =>
                                    setLightIsPulsingFast(false)
                                }
                                onClick={() => {
                                    setLightIsPulsingFast(false);
                                    handleSelectSide(Side.LIGHT);
                                }}
                            >
                                <h3 className="title-h4 title-h4--white">
                                    Light
                                </h3>
                            </button>
                        ) : (
                            <h3 className="title-h4 title-h4--white">Light</h3>
                        )}
                        {sideSelectedByTeamMate !== Side.SHADOW &&
                        selectedSide !== Side.SHADOW ? (
                            <button
                                className="team-lobby-scene__side-button"
                                onMouseEnter={() =>
                                    setShadowRotationSpeed(0.02)
                                }
                                onMouseLeave={() =>
                                    setShadowRotationSpeed(0.005)
                                }
                                onClick={() => {
                                    setShadowRotationSpeed(0.005);
                                    handleSelectSide(Side.SHADOW);
                                }}
                            >
                                <h3 className="title-h4 title-h4--white">
                                    Shadow
                                </h3>
                            </button>
                        ) : (
                            <h3 className="title-h4 title-h4--white">Shadow</h3>
                        )}
                    </div>
                </div>
            </div>
        );
    },
);
TeamLobbyScene.displayName = 'TeamLobbyScene';
