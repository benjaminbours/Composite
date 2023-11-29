// vendors
import classNames from 'classnames';
import React from 'react';

interface IProps {
    color: string;
    onClick: () => void;
    teamChoice: {
        side: string;
        levelName: string;
    };
}

export default function ButtonJoinTeam({ color, onClick, teamChoice }: IProps) {
    const cssClass = classNames({
        buttonRect: true,
        ...(color ? { [color]: true } : {}),
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
