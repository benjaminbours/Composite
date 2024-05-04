// vendors
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Side } from '@benjaminbours/composite-core';
import { Level } from '@benjaminbours/composite-api-client';
import { useSearchParams } from 'next/navigation';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { useStoreState } from '../../../hooks';
import { AuthModal } from '../../../03_organisms/AuthModal';

import { PlayerState, ServerCounts } from '../../../useMainController';
import { PlayersState } from './PlayersState';
import { SideSelector } from './SideSelector';
import { LevelSelector } from './LevelSelector';
import { UserMenu } from '../../../02_molecules/TopBar/UserMenu';
import { DiscordButton } from '../../../02_molecules/DiscordButton';
import InfoIcon from '@mui/icons-material/Info';

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
    serverCounts?: ServerCounts;
    fetchTime: number;
    setLightIsPulsingFast: (isPulsingFast: boolean) => void;
    setShadowRotationSpeed: (speed: number) => void;
    setSideSize: (side: Side, size: number) => void;
    inviteFriend: () => Promise<string>;
    handleEnterTeamLobby: (inviteFriendToken: string) => void;
    handleEnterRandomQueue: () => void;
    handleExitRandomQueue: () => void;
    handleClickReadyToPlay: () => void;
    fetchServerInfo: () => Promise<void>;
    // handleClickOnQueueInfo: () => void;
}

// TODO: Wrap all scenes with react.memo to prevent useless re-render
// TODO: too much duplicate between useController, TeamLobbyScene and Menu. Clean this shit please
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
        serverCounts,
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
        fetchServerInfo,
        // handleClickOnQueueInfo,
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

        // TODO: Duplicate from useController level editor
        // effect responsible to close the auth modal after successful login
        useEffect(() => {
            if (isAuthenticated && isAuthModalOpen) {
                setIsAuthModalOpen(false);
            }
        }, [isAuthenticated, isAuthModalOpen]);

        // on mount
        useEffect(() => {
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
            const level = Number(urlSearchParams.get('level'));
            if (isMount) {
                if (levels.length === 0) {
                    return;
                }
                handleSelectLevel(
                    Number.isNaN(level) || level === 0 ? levels[0].id : level,
                );
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isMount, levels]);

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
                    <UserMenu
                        dictionary={dictionary.common}
                        disabled={isInQueue}
                        onLoginClick={() => setIsAuthModalOpen(true)}
                    />
                </div>
                <div className="team-lobby-scene__column-left">
                    <PlayersState
                        players={[you, mate]}
                        onInviteFriend={inviteFriend}
                        isInQueue={isInQueue}
                        levels={levels}
                    />
                    <div className="team-lobby-scene__lobby-helper">
                        <InfoIcon style={{ marginTop: 20 }} />
                        <p>
                            <b>Composite</b> is a <b>cooperative multiplayer</b>{' '}
                            game. To start a game, <b>2 players are required</b>
                            . Select a level, select a side, then{' '}
                            <b>send an invite link to a friend</b> or match with
                            a random player if there are some in the queue.
                        </p>
                        <p>
                            {`It's funnier if you can speak by voice with your
                            teammate. We have dedicated vocal rooms on Discord.`}
                        </p>
                        <DiscordButton />
                    </div>
                </div>
                <div className="team-lobby-scene__column-right">
                    <LevelSelector
                        disabled={isInQueue}
                        levels={levels}
                        levelSelectedByMate={mate?.level}
                        handleSelectLevel={handleSelectLevel}
                        fetchServerInfo={fetchServerInfo}
                        // handleClickOnQueueInfo={handleClickOnQueueInfo}
                        shouldDisplayQueueInfo={shouldDisplayQueueInfo}
                        fetchTime={fetchTime}
                        serverCounts={serverCounts}
                        selectedLevel={you.level}
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
