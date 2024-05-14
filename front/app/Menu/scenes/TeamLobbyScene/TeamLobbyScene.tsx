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
import CircularProgress from '@mui/material/CircularProgress';
import { LevelSelector } from './LevelSelector';
import { UserMenu } from '../../../02_molecules/TopBar/UserMenu';
import { DiscordButton } from '../../../02_molecules/DiscordButton';
import { CopyToClipBoardButton } from '../../CopyToClipboardButton';
import { QueueTimeInfo } from './QueueTimeInfo';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { MainControllerContext } from '../../../MainApp';
import { LobbyMode } from '../../../useMainController';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import PersonIcon from '@mui/icons-material/Person';
import Badge from '@mui/material/Badge';
import InfoIcon from '@mui/icons-material/Info';

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

        const isAlignWithTeamMate =
            state.mate &&
            state.you.level === state.mate.level &&
            state.you.side !== undefined &&
            state.mate.side !== undefined &&
            state.you.side !== null &&
            state.mate.side !== null &&
            state.you.side !== state.mate.side;

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
                    <button className="buttonRect white" onClick={exitLobby}>
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
                        <Tab label="Solo (coming soon)" disabled />
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
                <LevelSelector disabled={state.isInQueue} />
                <div className="team-lobby-scene__buttons-container">
                    {state.mate && (
                        <>
                            <p
                                className="teammate-joined-text"
                                style={{
                                    textAlign: 'left',
                                }}
                            >
                                <InfoIcon
                                    style={{
                                        color: 'white',
                                    }}
                                />
                                <PersonIcon />
                                <span>
                                    <b>{state.mate.account?.name || 'Guest'}</b>{' '}
                                    joined the lobby
                                </span>
                            </p>
                            <DiscordButton className="rect-button" />
                        </>
                    )}
                    {lobbyMode === LobbyMode.DUO_WITH_FRIEND && (
                        <>
                            {state.mate ? (
                                <>
                                    <button
                                        className="rect-button"
                                        disabled={
                                            state.mate.level === undefined ||
                                            state.mate.level === null ||
                                            state.mate.side === null ||
                                            state.mate.side === undefined
                                        }
                                        onClick={handleAlignWithTeamMate}
                                    >
                                        {isAlignWithTeamMate ? (
                                            <>
                                                Aligned with team mate
                                                <CheckBoxIcon color="success" />
                                            </>
                                        ) : (
                                            <>
                                                Align with team mate{' '}
                                                <CheckBoxOutlineBlankIcon />
                                            </>
                                        )}
                                    </button>
                                    {/* <p style={{ maxWidth: 344, textAlign: 'left' }}>
                                    {`It's funnier if you can speak by voice with your
                            teammate. We have dedicated vocal rooms on Discord.`}
                                </p> */}
                                    {/* TODO: Add integration discord to create vocal room on demand */}
                                </>
                            ) : (
                                <CopyToClipBoardButton
                                    className="rect-button"
                                    text="Copy invite link"
                                    asyncAction={handleInviteFriend}
                                />
                            )}
                            {state.isWaitingForFriend && (
                                <div className="team-lobby-scene__waiting-friend-container">
                                    <InfoIcon
                                        style={{
                                            color: 'white',
                                            marginTop: 10,
                                        }}
                                    />
                                    <p>
                                        Send the link to your friend so he can
                                        join you!
                                    </p>
                                    <p>Waiting for friend...</p>
                                    <CircularProgress />
                                </div>
                            )}
                        </>
                    )}
                    {state.isInQueue && <QueueTimeInfo />}
                    {state.mate &&
                        state.you.level !== undefined &&
                        state.you.side !== undefined &&
                        state.you.side !== null &&
                        state.mate.side !== null &&
                        state.you.level === state.mate.level &&
                        state.mate.side !== state.you.side && (
                            <button
                                className="rect-button ready-button"
                                onClick={handleClickReadyToPlay}
                            >
                                <span>Ready:</span>
                                <div>
                                    You
                                    {state.you.isReady ? (
                                        <CheckBoxIcon color="success" />
                                    ) : (
                                        <CheckBoxOutlineBlankIcon />
                                    )}
                                </div>

                                <div>
                                    Mate
                                    {state.mate.isReady ? (
                                        <CheckBoxIcon color="success" />
                                    ) : (
                                        <CheckBoxOutlineBlankIcon />
                                    )}
                                </div>
                            </button>
                        )}
                </div>
            </div>
        );
    },
);
TeamLobbyScene.displayName = 'TeamLobbyScene';
