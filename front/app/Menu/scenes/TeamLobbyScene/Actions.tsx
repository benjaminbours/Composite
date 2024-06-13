import React, { useContext, useEffect, useRef } from 'react';
import { MainControllerContext } from '../../../MainApp';
import { LobbyMode } from '../../../useMainController';
import { QueueTimeInfo } from './QueueTimeInfo';
import { CopyToClipBoardButton } from '../../CopyToClipboardButton';
import { YingYang } from './YingYang';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import { DiscordButton } from '../../../02_molecules/DiscordButton';
import CircularProgress from '@mui/material/CircularProgress';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

export const Actions: React.FC = () => {
    const {
        state,
        lobbyMode,
        handleInviteFriend,
        handleClickReadyToPlay,
        handleAlignWithTeamMate,
        handleStartSolo,
    } = useContext(MainControllerContext);

    const startSoloRef = useRef<HTMLButtonElement>(null);
    const inviteFriendRef = useRef<HTMLButtonElement>(null);
    const queueTimeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (startSoloRef.current) {
            startSoloRef.current.scrollIntoView();
        } else if (
            inviteFriendRef.current &&
            state.you.level !== undefined &&
            state.you.side !== undefined
        ) {
            inviteFriendRef.current.scrollIntoView();
        } else if (queueTimeRef.current && state.isInQueue) {
            queueTimeRef.current.scrollIntoView();
        }
    }, [state.you.level, state.you.side, state.isInQueue, lobbyMode]);

    if (lobbyMode === LobbyMode.SOLO || lobbyMode === LobbyMode.PRACTICE) {
        return (
            <div className="team-lobby-scene__buttons-container">
                {state.you.level !== undefined && (
                    <button
                        ref={startSoloRef}
                        className="composite-button main-action team-lobby-scene__align-button"
                        onClick={handleStartSolo}
                    >
                        Start{' '}
                        <YingYang className="composite-button__end-icon" />
                    </button>
                )}
            </div>
        );
    }

    if (lobbyMode === LobbyMode.DUO_WITH_RANDOM) {
        return (
            <div className="team-lobby-scene__buttons-container">
                {state.isInQueue && (
                    <QueueTimeInfo queueTimeRef={queueTimeRef} />
                )}
            </div>
        );
    }

    const noMateChoice =
        state.mate &&
        (state.mate.level === undefined ||
            state.mate.level === null ||
            state.mate.side === null ||
            state.mate.side === undefined);

    const isAlignWithTeamMate =
        state.mate &&
        state.you.level !== undefined &&
        state.you.side !== undefined &&
        state.you.side !== null &&
        state.mate.side !== null &&
        state.you.level === state.mate.level &&
        state.mate.side !== state.you.side;

    // this return is for LobbyMode.DUO_WITH_FRIEND mode
    return (
        <div className="team-lobby-scene__buttons-container">
            {state.mate ? (
                <>
                    <p
                        className="team-lobby-scene__info-text teammate-joined-text"
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
                            <b>{state.mate.account?.name || 'Guest'}</b> joined
                            the lobby
                        </span>
                    </p>
                    <DiscordButton className="composite-button" />
                    {noMateChoice && (
                        <p
                            className="team-lobby-scene__info-text teammate-joined-text"
                            style={{
                                textAlign: 'left',
                            }}
                        >
                            <InfoIcon
                                style={{
                                    color: 'white',
                                }}
                            />
                            <span>
                                Choose a level and a side with your teammate
                            </span>
                        </p>
                    )}
                    {!noMateChoice && !isAlignWithTeamMate && (
                        <button
                            className="composite-button main-action team-lobby-scene__align-button"
                            onClick={handleAlignWithTeamMate}
                        >
                            Align with team mate <YingYang />
                        </button>
                    )}
                    {/* <p style={{ maxWidth: 344, textAlign: 'left' }}>
                                    {`It's funnier if you can speak by voice with your
                            teammate. We have dedicated vocal rooms on Discord.`}
                                </p> */}
                    {/* TODO: Add integration discord to create vocal room on demand */}
                    {isAlignWithTeamMate && (
                        <div className="team-lobby-scene__ready-container">
                            <button
                                className="composite-button main-action"
                                onClick={handleClickReadyToPlay}
                            >
                                <span>Ready:</span>
                                {/* <div> */}
                                {state.you.isReady ? (
                                    <CheckBoxIcon color="success" />
                                ) : (
                                    <CheckBoxOutlineBlankIcon />
                                )}
                                {/* </div> */}
                            </button>
                            <div className="team-lobby-scene__info-text">
                                <InfoIcon
                                    style={{
                                        color: 'white',
                                    }}
                                />
                                <span>Mate</span>
                                {state.mate.isReady ? (
                                    <CheckBoxIcon color="success" />
                                ) : (
                                    <CheckBoxOutlineBlankIcon />
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <CopyToClipBoardButton
                        buttonRef={inviteFriendRef}
                        className="composite-button main-action"
                        text="Copy invite link"
                        asyncAction={handleInviteFriend}
                    />
                    {state.isWaitingForFriend && (
                        <div className="team-lobby-scene__waiting-friend-container team-lobby-scene__info-text">
                            <InfoIcon
                                style={{
                                    color: 'white',
                                    marginTop: 10,
                                }}
                            />
                            <p>
                                Send the link to your friend so he can join you!
                            </p>
                            <p>Waiting for friend...</p>
                            <CircularProgress />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
