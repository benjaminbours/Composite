// vendors
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
// our libs
import { Side } from '@benjaminbours/composite-core';
// local
import { CopyToClipBoardIcon } from './CopyToClipboardIcon';
import { MenuStateInfo } from './MenuStateInfo';

interface Props {
    queueRef: React.RefObject<HTMLDivElement>;
    currentScene: string;
    side?: Side;
    levelName?: string;
    isInQueue: boolean;
    actions: React.ReactNode;
}

export const QueueScene: React.FC<Props> = ({
    queueRef,
    currentScene,
    side,
    levelName,
    isInQueue,
    actions,
}) => {
    const [queueTime, setQueueTime] = useState(0);
    const [shouldDisplayIsCopied, setShouldDisplayIsCopied] = useState(false);
    const color = side === Side.SHADOW ? 'black' : 'white';
    const cssClass = classNames({
        'content-container': true,
        'queue-container': true,
        [`queue-container--${color}`]: side ? true : false,
        ...(currentScene !== 'queue' ? { unmount: true } : {}),
    });

    const queueText = useMemo(
        () => ({
            0: `Waiting for a light`,
            1: `Waiting for a shadow`,
        }),
        [levelName],
    );

    const handleClickCopyToClipBoard = useCallback(() => {
        navigator.clipboard.writeText(process.env.NEXT_PUBLIC_URL!);
        setShouldDisplayIsCopied(true);
        setTimeout(() => {
            setShouldDisplayIsCopied(false);
        }, 3000);
    }, []);

    useEffect(() => {
        if (!isInQueue) {
            setQueueTime(0);
            return;
        }
        const interval = setInterval(() => {
            setQueueTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [side]);

    return (
        <div ref={queueRef} className={cssClass}>
            {actions}
            <MenuStateInfo levelName={levelName} side={side} />
            {side !== undefined && (
                <h2
                    className={`title-h2${
                        side === Side.SHADOW ? ' title-h2--black' : ''
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
                <button
                    className={`buttonRect ${color}`}
                    onClick={handleClickCopyToClipBoard}
                >
                    <CopyToClipBoardIcon color={color} />
                    <p>
                        {shouldDisplayIsCopied
                            ? 'Copied to clipboard'
                            : process.env.NEXT_PUBLIC_URL}
                    </p>
                </button>
            </div>
        </div>
    );
};
