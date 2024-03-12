// vendors
import classNames from 'classnames';
import React from 'react';
// our libs
import { AllQueueInfo } from '@benjaminbours/composite-core';
import { Level } from '@benjaminbours/composite-api-client';
// local
import LevelItem from './LevelItem';

interface Props {
    levelRef: React.RefObject<HTMLDivElement>;
    onClickOnLevel: (levelId: number) => void;
    allQueueInfo?: AllQueueInfo;
    actions: React.ReactNode;
    levels: Level[];
    isMount: boolean;
}

export const LevelScene: React.FC<Props> = ({
    levelRef,
    onClickOnLevel,
    allQueueInfo,
    actions,
    levels,
    isMount,
}) => {
    const cssClass = classNames({
        'content-container': true,
        'level-container': true,
        unmount: !isMount,
    });

    return (
        <div ref={levelRef} className={cssClass}>
            {actions}
            <h2 className="title-h2 title-h2--white">Select a&nbsp;level</h2>
            {levels.map((level) => (
                <LevelItem
                    {...level}
                    key={level.name}
                    onClick={onClickOnLevel}
                    queueInfo={allQueueInfo?.levels[level.id]}
                />
            ))}
        </div>
    );
};
