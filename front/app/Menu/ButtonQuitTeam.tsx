// vendors
import classNames from 'classnames';
import React from 'react';

interface IProps {
    color: string;
    onClick: () => void;
}

export default function ButtonQuitTeam({ color, onClick }: IProps) {
    const cssClass = classNames({
        buttonRect: true,
        ...(color ? { [color]: true } : {}),
    });
    return (
        <button
            className={cssClass}
            onClick={onClick}
            title="You are still in an instance with your last team mate."
        >
            Quit current team
        </button>
    );
}
