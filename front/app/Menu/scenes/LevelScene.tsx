// vendors
import classNames from 'classnames';
import React from 'react';
// our libs
import { AllQueueInfo, Levels } from '@benjaminbours/composite-core';
// local
import LevelItem from './LevelItem';

interface Props {
    levelRef: React.RefObject<HTMLDivElement>;
    currentScene: string;
    handleClickOnLevel: (levelId: Levels) => void;
    allQueueInfo?: AllQueueInfo;
    actions: React.ReactNode;
    levels: {
        id: Levels;
        name: string;
        img: string;
        disabled: boolean;
    }[];
}

export const LevelScene: React.FC<Props> = ({
    levelRef,
    currentScene,
    handleClickOnLevel,
    allQueueInfo,
    actions,
    levels,
}) => {
    const cssClass = classNames({
        'content-container': true,
        'level-container': true,
        ...(currentScene !== 'level' ? { unmount: true } : {}),
    });

    return (
        <div ref={levelRef} className={cssClass}>
            {actions}
            <h2 className="title-h2">Select a&nbsp;level</h2>
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
