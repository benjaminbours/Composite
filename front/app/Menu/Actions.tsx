import React from 'react';
import ButtonBack from './ButtonBack';
import ButtonQuitTeam from './ButtonQuitTeam';
import ButtonJoinTeam from './ButtonJoinTeam';
import { Side, TeammateInfoPayload } from '@benjaminbours/composite-core';

interface Props {
    color: string;
    onBack?: () => void;
    onQuitTeam?: () => void;
    teamMate: {
        info: TeammateInfoPayload | undefined;
        levelName: string | undefined;
        onJoin: () => void;
    };
}

export const Actions: React.FC<Props> = ({
    color,
    onBack,
    onQuitTeam,
    teamMate,
}) => {
    return (
        <div className="menu-actions">
            {onBack && <ButtonBack color={color} onClick={onBack} />}
            {onQuitTeam && (
                <ButtonQuitTeam color={color} onClick={onQuitTeam} />
            )}
            {teamMate.info && (
                <ButtonJoinTeam
                    color={color}
                    onClick={teamMate.onJoin}
                    teamChoice={{
                        levelName: teamMate.levelName || 'undefined',
                        side:
                            teamMate.info?.side === Side.LIGHT
                                ? 'Light'
                                : 'Shadow',
                    }}
                />
            )}
        </div>
    );
};
