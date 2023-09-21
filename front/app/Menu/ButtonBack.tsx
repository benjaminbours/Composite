// vendors
import classNames from 'classnames';
import React from 'react';

interface IProps {
    color: string;
    onClick: () => void;
}

export default function ButtonBack({ color, onClick }: IProps) {
    const cssClass = classNames({
        buttonRect: true,
        back: true,
        ...(color ? { [color]: true } : {}),
    });
    return (
        <button className={cssClass} onClick={onClick}>
            Back
        </button>
    );
}
