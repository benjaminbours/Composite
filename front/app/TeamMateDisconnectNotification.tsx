import React from 'react';

interface Props {
    teamMateDisconnected: boolean;
    handleClickFindAnotherTeamMate: () => void;
}

export const TeamMateDisconnectNotification: React.FC<Props> = ({
    teamMateDisconnected,
    handleClickFindAnotherTeamMate,
}) => {
    if (!teamMateDisconnected) {
        return null;
    }

    return (
        // TODO: Make appear disappear animation
        <div className="team-mate-disconnect">
            <p>Your team mate disconnected or has quit the room</p>
            <button
                className="buttonRect white"
                onClick={handleClickFindAnotherTeamMate}
            >
                Find another team mate
            </button>
        </div>
    );
};
