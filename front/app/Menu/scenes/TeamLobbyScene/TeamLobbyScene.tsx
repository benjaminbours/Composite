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
import LogoutIcon from '@mui/icons-material/Logout';
import CircularProgress from '@mui/material/CircularProgress';
import { LevelSelector } from './LevelSelector';
import { UserMenu } from '../../../02_molecules/TopBar/UserMenu';
import { DiscordButton } from '../../../02_molecules/DiscordButton';
import LoginIcon from '@mui/icons-material/Login';
import { CopyToClipBoardButton } from '../../CopyToClipboardButton';
import { QueueTimeInfo } from './QueueTimeInfo';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { MainControllerContext } from '../../../MainApp';
import { LobbyMode } from '../../../useMainController';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>;
    isMount: boolean;
}

export const TeamLobbyScene: React.FC<Props> = React.memo(
    ({ dictionary, isMount }) => {
        const {
            state,
            levels,
            refHashMap,
            lobbyMode,
            handleChangeLobbyMode,
            handleSelectLevelOnLobby,
            handleInviteFriend,
            handleEnterTeamLobby,
            handleEnterRandomQueue,
            handleExitRandomQueue,
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

        // initial loading
        useEffect(() => {
            const level = Number(urlSearchParams.get('level'));
            if (isMount) {
                if (levels.length === 0) {
                    return;
                }
                handleSelectLevelOnLobby(
                    Number.isNaN(level) || level === 0 ? levels[0].id : level,
                );
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isMount, levels]);

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
                {/* <div className="team-lobby-scene__column-left">
                        <PlayersState
                            players={[you, mate]}
                            onInviteFriend={inviteFriend}
                            isInQueue={isInQueue}
                            levels={levels}
                        />
                        <div className="team-lobby-scene__lobby-helper">
                            <InfoIcon style={{ marginTop: 20 }} />
                            <p>
                                <b>Composite</b> is a{' '}
                                <b>cooperative multiplayer</b> game. To start a
                                game, <b>2 players are required</b>. Select a
                                level, select a side, then{' '}
                                <b>send an invite link to a friend</b> or match
                                with a random player if there are some in the
                                queue.
                            </p>
                            <p>
                                {`It's funnier if you can speak by voice with your
                            teammate. We have dedicated vocal rooms on Discord.`}
                            </p>
                            <DiscordButton />
                        </div>
                    </div> */}
                <div className="team-lobby-scene__tabs-container">
                    <Tabs
                        className="team-lobby-scene__tabs"
                        value={lobbyMode}
                        textColor="inherit"
                        onChange={handleTabChange}
                    >
                        <Tab label="Solo (coming soon)" disabled />
                        <Tab
                            label="Duo with friend"
                            disabled={state.you.side !== undefined}
                        />
                        <Tab
                            label="Duo with random"
                            disabled={state.you.side !== undefined}
                        />
                    </Tabs>
                </div>
                <LevelSelector disabled={state.isInQueue} />
                {lobbyMode === LobbyMode.DUO_WITH_FRIEND && (
                    <div className="buttons-container">
                        {state.mate ? (
                            <>
                                <button
                                    className="rect-button"
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
                                <p style={{ maxWidth: 400, textAlign: 'left' }}>
                                    {`It's funnier if you can speak by voice with your
                            teammate. We have dedicated vocal rooms on Discord.`}
                                </p>
                                {/* TODO: Add integration discord to create vocal room on demand */}
                                <DiscordButton />
                            </>
                        ) : (
                            <CopyToClipBoardButton
                                className="rect-button"
                                text="Copy invite link"
                                asyncAction={handleInviteFriend}
                            />
                        )}
                        {state.isWaitingForFriend && (
                            <>
                                <p>Waiting for friend...</p>
                                <CircularProgress />
                            </>
                        )}
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
                                        {/* TODO: Clear token in URL when starting a game in other timing as well */}
                                        {state.mate.isReady ? (
                                            <CheckBoxIcon color="success" />
                                        ) : (
                                            <CheckBoxOutlineBlankIcon />
                                        )}
                                    </div>
                                </button>
                            )}
                    </div>
                )}
                {state.you.side !== undefined && (
                    <div className="buttons-container">
                        {lobbyMode === LobbyMode.DUO_WITH_RANDOM && (
                            <>
                                {state.isInQueue ? (
                                    <button
                                        className="rect-button"
                                        onClick={handleExitRandomQueue}
                                    >
                                        <span>
                                            <b>Exit</b> matchmaking queue
                                        </span>
                                        <LogoutIcon color="error" />
                                    </button>
                                ) : (
                                    <button
                                        className="rect-button"
                                        onClick={handleEnterRandomQueue}
                                    >
                                        <span>
                                            <b>Enter</b> matchmaking queue
                                        </span>
                                        <LoginIcon color="success" />
                                    </button>
                                )}
                            </>
                        )}
                        {state.isInQueue && <QueueTimeInfo />}
                    </div>
                )}
            </div>
        );
    },
);
TeamLobbyScene.displayName = 'TeamLobbyScene';
