// vendors
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { MenuStateInfo } from '../MenuStateInfo';
import { CopyToClipBoardButton } from '../CopyToClipboardButton';

interface Props {
    queueRef: React.RefObject<HTMLDivElement>;
    side?: Side;
    levelName?: string;
    isInQueue: boolean;
    actions: React.ReactNode;
    isMount: boolean;
}

export const QueueScene: React.FC<Props> = ({
    queueRef,
    side,
    levelName,
    isInQueue,
    actions,
    isMount,
}) => {
    const [queueTime, setQueueTime] = useState(0);
    const color = side === Side.SHADOW ? 'black' : 'white';
    const cssClass = classNames({
        'content-container': true,
        'queue-container': true,
        [`queue-container--${color}`]: side ? true : false,
        unmount: !isMount,
    });

    const queueText = useMemo(
        () => ({
            0: `Waiting for a light`,
            1: `Waiting for a shadow`,
        }),
        [],
    );

    useEffect(() => {
        if (!isInQueue) {
            setQueueTime(0);
            return;
        }
        const interval = setInterval(() => {
            setQueueTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isInQueue]);

    return (
        <div ref={queueRef} className={cssClass}>
            {actions}
            <MenuStateInfo levelName={levelName} side={side} />
            {side !== undefined && (
                <h2
                    className={`title-h2${
                        side === Side.SHADOW
                            ? ' title-h2--black'
                            : 'title-h2--white'
                    }`}
                >
                    {queueText[side]}
                </h2>
            )}
            <h3 className="queue-time">
                <span className="menu-label">Time in queue:</span> {queueTime}
            </h3>
            <div className="queue-container__share">
                <p>{`Waiting time is too long?`}</p>
                <p>{`Share this link with your friends`}</p>
                <CopyToClipBoardButton
                    color="black"
                    text={process.env.NEXT_PUBLIC_URL || 'Missing env variable'}
                />
            </div>
        </div>
    );
};
