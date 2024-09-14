import React from 'react';

interface Props {
    handleClickFindAnotherTeamMate?: () => void;
}

export const TeamMateDisconnectNotification: React.FC<Props> = ({
    handleClickFindAnotherTeamMate,
}) => {
    return (
        // TODO: Make appear disappear animation
        <div className="team-mate-disconnect">
            <p>Your team mate disconnected or has quit the room</p>
            <button
                className="composite-button composite-button--small white"
                onClick={handleClickFindAnotherTeamMate}
            >
                Find another team mate
            </button>
        </div>
    );
};
