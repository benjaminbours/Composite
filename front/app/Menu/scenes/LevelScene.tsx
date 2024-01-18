// vendors
import classNames from 'classnames';
import React from 'react';
// our libs
import { AllQueueInfo, Levels } from '@benjaminbours/composite-core';
// local
import LevelItem from './LevelItem';

interface Props {
    levelRef: React.RefObject<HTMLDivElement>;
    handleClickOnLevel: (levelId: Levels) => void;
    allQueueInfo?: AllQueueInfo;
    actions: React.ReactNode;
    levels: {
        id: Levels;
        name: string;
        img: string;
        disabled: boolean;
    }[];
    isMount: boolean;
}

export const LevelScene: React.FC<Props> = ({
    levelRef,
    handleClickOnLevel,
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
            {levels.map((item) => (
                <LevelItem
                    {...item}
                    key={item.name}
                    onClick={handleClickOnLevel}
                    queueInfo={allQueueInfo?.levels[item.id]}
                />
            ))}
        </div>
    );
};
