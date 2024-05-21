// vendors
import classNames from 'classnames';
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { servicesContainer } from '../../../core/frameworks';
import { ApiClient } from '../../../core/services';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { useStoreState } from '../../../hooks';
import { AuthModal } from '../../../03_organisms/AuthModal';
import { LevelSelector } from './LevelSelector';
import { UserMenu } from '../../../02_molecules/TopBar/UserMenu';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { MainControllerContext } from '../../../MainApp';
import { LobbyMode } from '../../../useMainController';
import PersonIcon from '@mui/icons-material/Person';
import Badge from '@mui/material/Badge';
import { Actions } from './Actions';
import { useWindowSize } from '../../../hooks/useWindowSize';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    isMount: boolean;
}

export const TeamLobbyScene: React.FC<Props> = React.memo(
    ({ dictionary, isMount }) => {
        const {
            state,
            serverCounts,
            refHashMap,
            lobbyMode,
            handleChangeLobbyMode,
            handleInviteFriend,
            handleEnterTeamLobby,
            handleClickReadyToPlay,
            handleAlignWithTeamMate,
            exitLobby,
        } = useContext(MainControllerContext);

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

        const handleTabChange = useCallback(
            (_e: any, value: LobbyMode) => {
                handleChangeLobbyMode(value);
            },
            [handleChangeLobbyMode],
        );

        const { width, height } = useWindowSize();
        const isMobile =
            width !== undefined &&
            height !== undefined &&
            (width <= 768 || height <= 500);

        return (
            <div ref={refHashMap.teamLobbyRef} className={cssClass}>
                <AuthModal
                    setIsModalOpen={setIsAuthModalOpen}
                    isModalOpen={isAuthModalOpen}
                    dictionary={dictionary.common}
                    text="Login to your account or continue as guest"
                    withGuest
                />
                <div className="team-lobby-scene__header">
                    <button
                        className="composite-button white"
                        onClick={exitLobby}
                    >
                        Exit
                    </button>
                    <h1 className="title-h3 title-h3--white">Lobby</h1>
                    <UserMenu
                        dictionary={dictionary.common}
                        disabled={state.isInQueue}
                        onLoginClick={() => setIsAuthModalOpen(true)}
                    />
                </div>
                <div className="team-lobby-scene__tabs-container">
                    <Tabs
                        className="team-lobby-scene__tabs"
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
                <LevelSelector isMobile={isMobile} disabled={state.isInQueue} />
                <Actions />
            </div>
        );
    },
);
TeamLobbyScene.displayName = 'TeamLobbyScene';
