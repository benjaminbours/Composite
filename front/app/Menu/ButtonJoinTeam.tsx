// vendors
import classNames from 'classnames';
import React from 'react';

interface IProps {
    onClick: () => void;
    teamChoice: {
        side: string;
        levelName: string;
    };
}

export default function ButtonJoinTeam({ onClick, teamChoice }: IProps) {
    const cssClass = classNames({
        buttonRect: true,
    });
    return (
        <button
            className={cssClass}
            onClick={onClick}
            title={`Your team mate has chosen the level: "${teamChoice.levelName}" and the side "${teamChoice.side}"`}
        >
            Join team mate
        </button>
    );
}
