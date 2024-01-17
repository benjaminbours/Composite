import { Levels, QueueInfo } from '@benjaminbours/composite-core';
import React from 'react';
import { QueueInfoText } from '../QueueInfo';
import classNames from 'classnames';

interface IProps {
    id: Levels;
    name: string;
    img: string;
    disabled: boolean;
    onClick: (level: Levels) => void;
    queueInfo?: QueueInfo;
}

export default function LevelItem({
    id,
    name,
    img,
    onClick,
    queueInfo,
    disabled,
}: IProps) {
    const cssClass = classNames({
        'level-item': true,
        'level-item--disabled': disabled,
    });
    return (
        <div
            className={cssClass}
            onClick={() => {
                if (!disabled) {
                    onClick(id);
                }
            }}
        >
            <img src={img} alt={`screenshot of the level ${name}`} />
            <div className="level-item__center">
                <h3>{name}</h3>
                {disabled && <p>Coming soong</p>}
            </div>
            <div className="level-item__queue-space">
                {queueInfo && (
                    <QueueInfoText side="light" value={queueInfo.light} />
                )}
                {queueInfo && (
                    <QueueInfoText side="shadow" value={queueInfo.shadow} />
                )}
            </div>
        </div>
    );
}
