// vendors
import classNames from 'classnames';
import React from 'react';
// our libs
import { AllQueueInfo, Levels, Side } from '@benjaminbours/composite-core';
// local
import { QueueInfoText } from '../QueueInfo';
import { MenuStateInfo } from '../MenuStateInfo';

interface Props {
    sideRef: React.RefObject<HTMLDivElement>;
    selectedLevel?: Levels;
    levelName?: string;
    handleClickOnFaction: (side: Side) => void;
    allQueueInfo?: AllQueueInfo;
    actions: React.ReactNode;
    isMount: boolean;
}

export const SideScene: React.FC<Props> = ({
    sideRef,
    selectedLevel,
    levelName,
    handleClickOnFaction,
    allQueueInfo,
    actions,
    isMount,
}) => {
    const cssClass = classNames({
        'content-container': true,
        'faction-container': true,
        unmount: !isMount,
    });

    return (
        <div ref={sideRef} className={cssClass}>
            {actions}
            <MenuStateInfo levelName={levelName} />
            <h2 className="title-h2 title-h2--white">Select a&nbsp;side</h2>
            {/* <p>{`Selected level: ${levelName}`}</p> */}
            <button
                className="buttonCircle factionButton white"
                // TODO: had same interaction as on home page
                // onMouseEnter={handleMouseEnterPlay}
                // onMouseLeave={handleMouseLeavePlay}
                onClick={() => handleClickOnFaction(Side.LIGHT)}
            >
                light
            </button>
            <button
                className="buttonCircle factionButton black"
                // TODO: had same interaction as on home page
                // onMouseEnter={handleMouseEnterPlay}
                // onMouseLeave={handleMouseLeavePlay}
                onClick={() => handleClickOnFaction(Side.SHADOW)}
            >
                shadow
            </button>
            {allQueueInfo && selectedLevel !== undefined && (
                <>
                    <QueueInfoText
                        side="light"
                        value={allQueueInfo.levels[selectedLevel].light}
                    />
                    <QueueInfoText
                        side="shadow"
                        value={allQueueInfo.levels[selectedLevel].shadow}
                    />
                </>
            )}
        </div>
    );
};
