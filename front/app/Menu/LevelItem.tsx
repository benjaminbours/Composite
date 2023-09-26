import { Levels, QueueInfo } from '@benjaminbours/composite-core';
import React from 'react';
import { QueueInfoText } from './QueueInfo';

interface IProps {
    id: Levels;
    name: string;
    img: string;
    onClick: (level: Levels) => void;
    queueInfo?: QueueInfo;
}

export default function LevelItem({
    id,
    name,
    img,
    onClick,
    queueInfo,
}: IProps) {
    return (
        <div className="level-item" onClick={() => onClick(id)}>
            <img src={img} alt={`screenshot of the level ${name}`} />
            <div className="queue-space" />
            <h3>{name}</h3>
            <div className="queue-space">
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
