import React from 'react';
import ButtonBack from './ButtonBack';
import ButtonQuitTeam from './ButtonQuitTeam';
import ButtonJoinTeam from './ButtonJoinTeam';
import { Side } from '@benjaminbours/composite-core';

interface Props {
    onBack?: () => void;
    onQuitTeam?: () => void;
    // teamMate?: {
    //     info: TeammateInfoPayload | undefined;
    //     levelName: string | undefined;
    // };
    // onClickJoinTeamMate: () => void;
}

export const Actions: React.FC<Props> = ({
    onBack,
    onQuitTeam,
    // onClickJoinTeamMate,
    // teamMate,
}) => {
    return (
        <div className="menu-actions">
            {onBack && !onQuitTeam && <ButtonBack onClick={onBack} />}
            {onQuitTeam && <ButtonQuitTeam onClick={onQuitTeam} />}
            {/* {teamMate.info && (
                <ButtonJoinTeam
                    onClick={onClickJoinTeamMate}
                    teamChoice={{
                        levelName: teamMate.levelName || 'undefined',
                        side:
                            teamMate.info?.side === Side.LIGHT
                                ? 'Light'
                                : 'Shadow',
                    }}
                />
            )} */}
        </div>
    );
};
