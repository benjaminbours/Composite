// vendors
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { servicesContainer } from '../../../core/frameworks';
import { CoreApiClient } from '../../../core/services';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { useStoreState } from '../../../hooks';
import { AuthModal } from '../../../03_organisms/AuthModal';
import PersonIcon from '@mui/icons-material/Person';
import Badge from '@mui/material/Badge';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { CustomSwitch } from './CustomSwitch';
import { Region } from '@hathora/cloud-sdk-typescript/models/components';
import Visibility from '@mui/icons-material/Visibility';
import { JoinGame } from './JoinGame';
import { CreateLobby } from './CreateLobby/CreateLobby';
import {
    LevelStatusEnum,
    UpsertRatingDtoTypeEnum,
    type Level,
} from '@benjaminbours/composite-core-api-client';
import { useMenuTransitionContext } from '../../../contexts/menuTransitionContext';
import { MenuScene } from '../../../types';
import { computeLevelRatings } from '../../../utils/game';
import { useGlobalContext } from '../../../contexts';

export enum LobbyMode {
    CREATE = 'create',
    JOIN = 'join',
}

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
}

export const LobbyScene: React.FC<Props> = ({ dictionary }) => {
    // contexts
    const { menuScene, nextMenuScene, lobbyRef, goToHome } =
        useMenuTransitionContext();

    const { createGame, loadingFlow, loadingStep, gameData } =
        useGlobalContext();
    // const { enqueueSnackbar } = useSnackbar();

    // const urlSearchParams = useSearchParams();
    const isAuthenticated = useStoreState(
        (actions) => actions.user.isAuthenticated,
    );
    // const isRetrievingSession = useStoreState(
    //     (actions) => actions.user.isRetrievingSession,
    // );

    // local
    const [levels, setLevels] = useState<Level[]>([]);
    const [isLoadingLevels, setIsLoadingLevels] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    // const isConnecting = useRef(false);

    const cssClass = useMemo(() => {
        const isMount =
            menuScene === MenuScene.TEAM_LOBBY ||
            nextMenuScene === MenuScene.TEAM_LOBBY;

        return classNames({
            'content-container': true,
            lobby: true,
            unmount: !isMount,
        });
    }, [menuScene, nextMenuScene]);

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

    // TODO: Duplicate from useController level editor
    // effect responsible to close the auth modal after successful login
    useEffect(() => {
        if (isAuthenticated && isAuthModalOpen) {
            setIsAuthModalOpen(false);
        }
    }, [isAuthenticated, isAuthModalOpen]);

    // // on mount
    // useEffect(() => {
    //     const token = urlSearchParams.get('token');
    //     if (!token || isConnecting.current) {
    //         return;
    //     }

    //     isConnecting.current = true;
    //     const onError = (error?: any) => {
    //         if (error) {
    //             console.error(error);
    //         }
    //         enqueueSnackbar(
    //             'The lobby you are trying to join is not valid or does not exist anymore.',
    //             {
    //                 variant: 'error',
    //             },
    //         );
    //     };
    //     const apiClient = servicesContainer.get(CoreApiClient);
    //     apiClient.defaultApi
    //         .appControllerCheckInviteValidity({
    //             inviteToken: token,
    //         })
    //         .then((res: any) => {
    //             const isTokenValid = res === 'true' ? true : false;
    //             if (isTokenValid) {
    //                 handleEnterTeamLobby(token);
    //             } else {
    //                 onError();
    //             }
    //         })
    //         .catch(onError)
    //         .finally(() => {
    //             isConnecting.current = false;
    //         });
    // }, [
    //     isConnecting,
    //     urlSearchParams,
    //     enqueueSnackbar,
    //     isRetrievingSession,
    //     isAuthenticated,
    //     handleEnterTeamLobby,
    //     isMount,
    // ]);

    const [lobbyMode, setLobbyMode] = useState<LobbyMode>(LobbyMode.CREATE);

    return (
        <div ref={lobbyRef} className={cssClass}>
            <AuthModal
                setIsModalOpen={setIsAuthModalOpen}
                isModalOpen={isAuthModalOpen}
                dictionary={dictionary.common}
                text="Login to your account or continue as guest"
                withGuest
            />
            <div className="lobby__header">
                <div>
                    <button
                        className="composite-button white"
                        onClick={goToHome}
                    >
                        Exit
                    </button>
                </div>
                <div>
                    <h1 className="title-h3 text-important">Lobby</h1>
                    <CustomSwitch
                        className="lobby__mode-selector"
                        selectedValue={lobbyMode}
                        onChange={(value) => setLobbyMode(value as LobbyMode)}
                        items={[
                            { text: 'Create', value: LobbyMode.CREATE },
                            { text: 'Join', value: LobbyMode.JOIN },
                        ]}
                    />
                </div>
            </div>
            <div className="lobby__main">
                {lobbyMode === LobbyMode.CREATE && (
                    <CreateLobby
                        onSubmit={createGame}
                        levels={levels}
                        isLoadingLevels={isLoadingLevels}
                        loadingFlow={loadingFlow}
                        loadingStep={loadingStep}
                    />
                )}
                {lobbyMode === LobbyMode.JOIN && <JoinGame />}
            </div>
            {/* <div className="lobby__tabs-container">
                    <Tabs
                        className="lobby__tabs"
                        value={lobbyMode}
                        textColor="inherit"
                        variant="scrollable"
                        scrollButtons="auto"
                        onChange={handleTabChange}
                    >
                        <Tab label="Practice" />
                        <Tab label="Solo" />
                        <Tab label="Duo with friend" />
                        <Tab
                            label={
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    Duo with random
                                    <Badge
                                        badgeContent={
                                            serverCounts?.matchmaking || 0
                                        }
                                        color="primary"
                                        showZero
                                    >
                                        <PersonIcon />
                                    </Badge>
                                </div>
                            }
                        />
                    </Tabs>
                </div>
                <Actions selectedRegion={selectedRegion} /> */}
        </div>
    );
};
