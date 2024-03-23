import Divider from '@mui/material/Divider';
import React, { useMemo } from 'react';
import { PlayerState } from '../../../useMainController';
import CircularProgress from '@mui/material/CircularProgress';
import { CopyToClipBoardButton } from '../../CopyToClipboardButton';
import { Side } from '@benjaminbours/composite-core';
import styles from './PlayersState.module.scss';

interface Props {
    players: (PlayerState | undefined)[];
    onInviteFriend: () => Promise<string>;
    isInQueue: boolean;
}

export const PlayersState: React.FC<Props> = ({
    players,
    isInQueue,
    onInviteFriend,
}) => {
    const playersState = useMemo(() => {
        return players.map((player, i) => {
            if (player === undefined) {
                return (
                    <div key={i} className={styles.row}>
                        <p>Waiting for mate...</p>
                        <CircularProgress size={30} className={styles.loader} />
                    </div>
                );
            }
            return (
                <div key={i} className={styles.row}>
                    <p>
                        <span>
                            {i === 0 ? 'You' : 'Mate'}:{` `}
                        </span>
                        <b>{player.account ? player.account.name : 'Guest'}</b>
                    </p>
                    {player.isReady && <p>Ready</p>}
                    {player.side !== undefined && (
                        <div
                            className={`${styles['side-indicator']} ${player.side === Side.LIGHT ? styles['side-indicator-light'] : styles['side-indicator-shadow']}`}
                        />
                    )}
                </div>
            );
        });
    }, [players]);

    return (
        <div className={styles.root}>
            <h3 className="title-h4">Players</h3>
            <Divider className={styles.divider} />
            {playersState}
            <CopyToClipBoardButton
                className={styles['invite-button']}
                text="Invite link"
                asyncAction={onInviteFriend}
                disabled={isInQueue}
            />
        </div>
    );
};
