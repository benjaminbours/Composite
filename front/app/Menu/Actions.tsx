import React from 'react';
import ButtonBack from './ButtonBack';
import ButtonQuitTeam from './ButtonQuitTeam';
import ButtonJoinTeam from './ButtonJoinTeam';

interface Props {
    color: string;
    onBack?: () => void;
    onQuitTeam?: () => void;
    onJoinTeam?: () => void;
}

export const Actions: React.FC<Props> = ({
    color,
    onBack,
    onQuitTeam,
    onJoinTeam,
}) => {
    return (
        <div className="menu-actions">
            {onBack && <ButtonBack color={color} onClick={onBack} />}
            {onQuitTeam && (
                <ButtonQuitTeam color={color} onClick={onQuitTeam} />
            )}
            {onJoinTeam && (
                <ButtonJoinTeam
                    color={color}
                    onClick={onJoinTeam}
                    teamChoice={{ levelName: 'Crack the door', side: 'Light' }}
                />
            )}
        </div>
    );
};
