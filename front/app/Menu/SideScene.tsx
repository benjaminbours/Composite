// vendors
import classNames from 'classnames';
import React from 'react';
// our libs
import { AllQueueInfo, Levels, Side } from '@benjaminbours/composite-core';
// local
import ButtonBack from './ButtonBack';
import { QueueInfoText } from './QueueInfo';

interface Props {
    sideRef: React.RefObject<HTMLDivElement>;
    currentScene: string;
    selectedLevel?: Levels;
    levelName?: string;
    handleClickOnBack: () => void;
    handleClickOnFaction: (side: Side) => void;
    allQueueInfo?: AllQueueInfo;
}

export const SideScene: React.FC<Props> = ({
    sideRef,
    currentScene,
    selectedLevel,
    levelName,
    handleClickOnBack,
    handleClickOnFaction,
    allQueueInfo,
}) => {
    const cssClass = classNames({
        'faction-container': true,
        ...(currentScene !== 'queue' ? { unmount: true } : {}),
    });

    return (
        <div ref={sideRef} className={cssClass}>
            <ButtonBack color="white" onClick={handleClickOnBack} />
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
