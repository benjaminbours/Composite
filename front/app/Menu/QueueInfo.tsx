import classNames from 'classnames';
import React from 'react';
import { Side } from 'three';

interface Props {
    className?: string;
    side: 'light' | 'shadow';
    value: number;
}

export const QueueInfoText: React.FC<Props> = ({ side, value }) => {
    if (value === 0) {
        return null;
    }
    const cssClass = classNames({
        'queue-count': true,
        [`queue-count--${side}`]: true,
    });
    const plural = value === 1 ? '' : 's';
    const text = `${value} ${side}${plural} waiting for you`;
    return <p className={cssClass}>{text}</p>;
};
