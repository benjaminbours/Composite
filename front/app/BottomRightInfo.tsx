import React from 'react';

interface Props {
    playing: number;
    matchmaking: number;
}

export const BottomRightInfo: React.FC<Props> = ({ matchmaking, playing }) => {
    return (
        <div className="bottom-right-info">
            <p className="version">
                <b>{playing}</b>
                {` players in games - `}
                <b>{matchmaking}</b>
                {` in matchmaking`}
            </p>
        </div>
    );
};
