import React from 'react';

interface Props {
    teamMateDisconnected: boolean;
    handleClickFindAnotherTeamMate?: () => void;
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
                className="composite-button white"
                onClick={handleClickFindAnotherTeamMate}
            >
                Find another team mate
            </button>
        </div>
    );
};
