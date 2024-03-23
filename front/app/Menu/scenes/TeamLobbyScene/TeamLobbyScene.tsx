// vendors
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AllQueueInfo, Side } from '@benjaminbours/composite-core';
import { Level } from '@benjaminbours/composite-api-client';
import { useSearchParams } from 'next/navigation';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { useStoreState } from '../../../hooks';
import { AuthModal } from '../../../03_organisms/AuthModal';

import { PlayerState } from '../../../useMainController';
import { PlayersState } from './PlayersState';
import { SideSelector } from './SideSelector';
import { LevelSelector } from './LevelSelector';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    teamLobbyRef: React.RefObject<HTMLDivElement>;
    isMount: boolean;
    handleSelectLevel: (levelId: number) => void;
    handleSelectSide: (side: Side) => void;
    handleClickOnExit: () => void;
    levels: Level[];
    you: PlayerState;
    mate?: PlayerState;
    isInQueue: boolean;
    shouldDisplayQueueInfo: boolean;
    queueInfo?: AllQueueInfo;
    fetchTime: number;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
    setSideSize: (side: Side, size: number) => void;
    inviteFriend: () => Promise<string>;
    handleEnterTeamLobby: (inviteFriendToken: string) => void;
    handleEnterRandomQueue: () => void;
    handleExitRandomQueue: () => void;
    handleClickReadyToPlay: () => void;
    fetchQueueInfo: () => Promise<void>;
    handleClickOnQueueInfo: () => void;
}

// TODO: Wrap all scenes with react.memo to prevent useless re-render
export const TeamLobbyScene: React.FC<Props> = React.memo(
    ({
        teamLobbyRef,
        dictionary,
        isMount,
        levels,
        you,
        mate,
        isInQueue,
        shouldDisplayQueueInfo,
        queueInfo,
        fetchTime,
        handleSelectLevel,
        handleSelectSide,
        setLightIsPulsingFast,
        setShadowRotationSpeed,
        inviteFriend,
        handleEnterTeamLobby,
        handleClickReadyToPlay,
        setSideSize,
        handleEnterRandomQueue,
        handleExitRandomQueue,
        fetchQueueInfo,
        handleClickOnQueueInfo,
        handleClickOnExit,
    }) => {
        const { enqueueSnackbar } = useSnackbar();
        const urlSearchParams = useSearchParams();
        const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
        const isConnecting = useRef(false);
        const isGuest = useStoreState((actions) => actions.user.isGuest);
        const isAuthenticated = useStoreState(
            (actions) => actions.user.isAuthenticated,
        );
        const isRetrievingSession = useStoreState(
            (actions) => actions.user.isRetrievingSession,
        );
        const cssClass = classNames({
            'content-container': true,
            'team-lobby-scene': true,
            unmount: !isMount,
        });

        // on mount
        useEffect(() => {
            if (
                !isGuest &&
                !isAuthenticated &&
                !isRetrievingSession &&
                isMount
            ) {
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
            isMount,
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
                    <button
                        className="buttonRect white"
                        onClick={handleClickOnExit}
                    >
                        Exit
                    </button>
                    <h1 className="title-h3 title-h3--white">Lobby</h1>
                </div>
                <div className="team-lobby-scene__column-left">
                    <PlayersState
                        players={[you, mate]}
                        onInviteFriend={inviteFriend}
                        isInQueue={isInQueue}
                    />
                </div>
                <div className="team-lobby-scene__column-right">
                    <LevelSelector
                        disabled={isInQueue}
                        levels={levels}
                        levelSelectedByMate={mate?.level}
                        handleSelectLevel={handleSelectLevel}
                        fetchQueueInfo={fetchQueueInfo}
                        handleClickOnQueueInfo={handleClickOnQueueInfo}
                        shouldDisplayQueueInfo={shouldDisplayQueueInfo}
                        fetchTime={fetchTime}
                        queueInfo={queueInfo}
                    />
                    <SideSelector
                        you={you}
                        mate={mate}
                        setLightIsPulsingFast={setLightIsPulsingFast}
                        setShadowRotationSpeed={setShadowRotationSpeed}
                        handleSelectSide={handleSelectSide}
                        handleClickReadyToPlay={handleClickReadyToPlay}
                        setSideSize={setSideSize}
                        inviteFriend={inviteFriend}
                        handleEnterRandomQueue={handleEnterRandomQueue}
                        handleExitRandomQueue={handleExitRandomQueue}
                        isInQueue={isInQueue}
                    />
                </div>
            </div>
        );
    },
);
TeamLobbyScene.displayName = 'TeamLobbyScene';
