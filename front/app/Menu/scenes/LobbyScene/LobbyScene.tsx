// vendors
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { getDictionary } from '../../../../getDictionary';
import { useStoreState } from '../../../hooks';
import { AuthModal } from '../../../03_organisms/AuthModal';
import PersonIcon from '@mui/icons-material/Person';
import Badge from '@mui/material/Badge';
import { CustomSwitch } from './CustomSwitch';
import { JoinGame } from './JoinGame';
import { CreateLobby } from './CreateLobby/CreateLobby';
import { useMenuTransitionContext } from '../../../contexts/menuTransitionContext';
import { MenuScene } from '../../../types';
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
    const { menuScene, nextMenuScene, lobbyRef } = useMenuTransitionContext();

    const { exitLobby, fetchLobbyInfo, loadingFlow } = useGlobalContext();

    const { enqueueSnackbar } = useSnackbar();

    const urlSearchParams = useSearchParams();
    const isAuthenticated = useStoreState(
        (actions) => actions.user.isAuthenticated,
    );
    // const isRetrievingSession = useStoreState(
    //     (actions) => actions.user.isRetrievingSession,
    // );

    // local
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
    useEffect(() => {
        const roomCode = urlSearchParams.get('roomCode');
        if (!roomCode) {
            return;
        }

        fetchLobbyInfo(roomCode)
            .then(() => {
                setLobbyMode(LobbyMode.JOIN);
            })
            .catch((error) => {
                console.error(error);
                enqueueSnackbar(
                    'The lobby you are trying to join is not valid or does not exist anymore.',
                    {
                        variant: 'error',
                    },
                );
            });
    }, [urlSearchParams, fetchLobbyInfo, enqueueSnackbar]);

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
                        onClick={exitLobby}
                    >
                        Exit
                    </button>
                </div>
                <div>
                    <h1 className="title-h3 text-important">Lobby</h1>
                    <CustomSwitch
                        className="lobby__mode-selector"
                        selectedValue={lobbyMode}
                        onChange={(value) => {
                            if (loadingFlow.length > 0) {
                                return;
                            }
                            setLobbyMode(value as LobbyMode);
                        }}
                        items={[
                            { text: 'Create', value: LobbyMode.CREATE },
                            { text: 'Join', value: LobbyMode.JOIN },
                        ]}
                    />
                </div>
            </div>
            <div className="lobby__main">
                {lobbyMode === LobbyMode.CREATE && <CreateLobby />}
                {lobbyMode === LobbyMode.JOIN && <JoinGame />}
            </div>
        </div>
    );
};
