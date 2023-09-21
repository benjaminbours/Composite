// vendors
import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';
// our libs
import { Side } from 'composite-core';
// local
import ButtonBack from './ButtonBack';
import { CopyToClipBoardIcon } from './CopyToClipboardIcon';

interface Props {
    queueRef: React.RefObject<HTMLDivElement>;
    currentScene: string;
    side?: Side;
    levelName?: string;
    handleClickOnBack: () => void;
}

export const QueueScene: React.FC<Props> = ({
    queueRef,
    currentScene,
    side,
    levelName,
    handleClickOnBack,
}) => {
    const [shouldDisplayIsCopied, setShouldDisplayIsCopied] = useState(false);
    const color = side === Side.SHADOW ? 'black' : 'white';
    const cssClass = classNames({
        'queue-container': true,
        [`queue-container--${color}`]: side ? true : false,
        ...(currentScene !== 'queue' ? { unmount: true } : {}),
    });

    const queueText = useMemo(
        () => ({
            0: `${levelName}\nWaiting for a light`,
            1: `${levelName}\nWaiting for a shadow`,
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

    return (
        <div ref={queueRef} className={cssClass}>
            <ButtonBack color={color} onClick={handleClickOnBack} />
            {side !== undefined && <h2>{queueText[side]}</h2>}
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
