// vendors
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import SlickSlider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Side } from '@benjaminbours/composite-core';
import { Level } from '@benjaminbours/composite-api-client';
import { LevelPortal } from '../LevelPortal';
import { useSearchParams } from 'next/navigation';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { useStoreState } from '../../../hooks';
import { AuthModal } from '../../../03_organisms/AuthModal';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import { PlayerState } from '../../../useMainController';
import { PlayersState } from './PlayersState';
import { SideSelector } from './SideSelector';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    teamLobbyRef: React.RefObject<HTMLDivElement>;
    actions: React.ReactNode;
    isMount: boolean;
    handleSelectLevel: (levelId: number) => void;
    handleSelectSide: (side: Side) => void;
    levels: Level[];
    you: PlayerState;
    mate?: PlayerState;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
    setSideSize: (side: Side, size: number) => void;
    inviteFriend: () => Promise<string>;
    handleEnterTeamLobby: (inviteFriendToken: string) => void;
    handleClickReadyToPlay: () => void;
}

// TODO: Wrap all scenes with react.memo to prevent useless re-render
export const TeamLobbyScene: React.FC<Props> = React.memo(
    ({
        teamLobbyRef,
        dictionary,
        actions,
        isMount,
        levels,
        you,
        mate,
        handleSelectLevel,
        handleSelectSide,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        inviteFriend,
        handleEnterTeamLobby,
        handleClickReadyToPlay,
        setSideSize,
    }) => {
        const { enqueueSnackbar } = useSnackbar();
        const urlSearchParams = useSearchParams();
        const [slideIndex, setSlideIndex] = useState(0);
        const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
        const isConnecting = useRef(false);
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
            focusOnSelect: true,
            infinite: false,
            centerPadding: '20px',
            useTransform: false,
            slidesToShow: 1,
            speed: 500,
            arrows: false,
            draggable: false,
            // waitForAnimate: false,
            beforeChange: function (currentSlide: number, nextSlide: number) {
                const level = levels[nextSlide];
                handleSelectLevel(level.id);
            },
            afterChange: function (currentSlide: number) {
                setSlideIndex(currentSlide);
            },
        };

        // effect to randomize portal animations
        useEffect(() => {
            document
                .querySelectorAll<HTMLElement>('.level-portal')
                .forEach((portal) => {
                    portal.style.setProperty(
                        '--x',
                        `${Math.random() * 100 - 50}%`,
                    ); // Random x between -50% and 50%
                    portal.style.setProperty(
                        '--y',
                        `${Math.random() * 100 - 50}%`,
                    ); // Random y between -50% and 50%
                });
        }, []);

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
            const onError = (error?: any) => {
                if (error) {
                    console.error(error);
                }
                enqueueSnackbar(
                    'The lobby you are trying to join is not valid or does not exist anymore.',
                    {
                        variant: 'error',
                    },
                );
            };
            const apiClient = servicesContainer.get(ApiClient);
            apiClient.defaultApi
                .appControllerCheckInviteValidity({
                    inviteToken: token,
                })
                .then((res: any) => {
                    const isTokenValid = res === 'true' ? true : false;
                    if (isTokenValid) {
                        handleEnterTeamLobby(token);
                    } else {
                        onError();
                    }
                })
                .catch(onError)
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
                    <h1 className="title-h3 title-h3--white">Lobby</h1>
                </div>
                <div className="team-lobby-scene__column-left">
                    <PlayersState
                        players={[you, mate]}
                        onInviteFriend={inviteFriend}
                    />
                </div>
                <div className="team-lobby-scene__column-right">
                    <div className="team-lobby-scene__level-container">
                        <h2 className="title-h3 title-h3--white">
                            Select a level
                        </h2>
                        <SlickSlider ref={sliderRef} {...settings}>
                            {levels.map(({ id, name }) => {
                                return (
                                    <LevelPortal
                                        name={name}
                                        key={id}
                                        isSelectedByTeamMate={
                                            id === mate?.level
                                        }
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/thumbnails/level_${id}_thumbnail.png`}
                                    />
                                );
                            })}
                        </SlickSlider>
                        <div className="team-lobby-scene__slider-controls">
                            <Slider
                                className="team-lobby-scene__slider-range"
                                size="small"
                                value={slideIndex}
                                min={0}
                                max={levels.length - 1}
                                onChange={(e, value) => {
                                    setSlideIndex(value as number);
                                }}
                                onChangeCommitted={(_, value) => {
                                    sliderRef.current?.slickGoTo(
                                        value as number,
                                    );
                                }}
                            />
                            <div>
                                <IconButton onClick={previous}>
                                    <ArrowBackIosNewIcon />
                                </IconButton>
                                <IconButton onClick={next}>
                                    <ArrowForwardIosIcon />
                                </IconButton>
                            </div>
                            <div />
                        </div>
                    </div>
                    <SideSelector
                        you={you}
                        mate={mate}
                        setLightIsPulsingFast={setLightIsPulsingFast}
                        setShadowRotationSpeed={setShadowRotationSpeed}
                        handleSelectSide={handleSelectSide}
                        handleClickReadyToPlay={handleClickReadyToPlay}
                        setSideSize={setSideSize}
                        inviteFriend={inviteFriend}
                    />
                </div>
            </div>
        );
    },
);
TeamLobbyScene.displayName = 'TeamLobbyScene';
