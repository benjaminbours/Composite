// vendors
import classNames from 'classnames';
import React from 'react';

interface IProps {
    onClick: () => void;
}

export default function ButtonBack({ onClick }: IProps) {
    const cssClass = classNames({
        buttonRect: true,
        back: true,
    });
    return (
        <button className={cssClass} onClick={onClick}>
            Back
        </button>
    );
}
