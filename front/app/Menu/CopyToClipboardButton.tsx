import React, { useCallback, useState } from 'react';
import classNames from 'classnames';

const CopyToClipBoardIcon: React.FC = () => {
    return (
        <svg viewBox="0 0 64 64">
            <path d="m40.648,14c-0.563,-1.178 -1.758,-2 -3.148,-2l-17,0c-1.93,0 -3.5,1.57 -3.5,3.5l0,28c0,1.488 0.938,2.754 2.25,3.259l0,-26.259c0,-3.584 2.916,-6.5 6.5,-6.5l14.898,0z" />
            <path d="m43.5,17l-17.75,0c-1.93,0 -3.5,1.57 -3.5,3.5l0,28c0,1.93 1.57,3.5 3.5,3.5l17.75,0c1.93,0 3.5,-1.57 3.5,-3.5l0,-28c0,-1.93 -1.57,-3.5 -3.5,-3.5z" />
            <path d="m56.781,0l-49.563,0c-3.981,0 -7.218,3.239 -7.218,7.219l0,49.562c0,3.981 3.237,7.219 7.218,7.219l49.563,0c3.981,0 7.219,-3.238 7.219,-7.219l0,-49.563c0,-3.98 -3.238,-7.218 -7.219,-7.218zm-6.781,48.5c0,3.584 -2.916,6.5 -6.5,6.5l-17.75,0c-3.103,0 -5.701,-2.188 -6.344,-5.1c-3.064,-0.522 -5.406,-3.189 -5.406,-6.4l0,-28c0,-3.584 2.916,-6.5 6.5,-6.5l17,0c3.072,0 5.648,2.146 6.322,5.017c3.434,0.169 6.178,3.008 6.178,6.483l0,28z" />
        </svg>
    );
};

interface Props {
    text: string;
    color: 'black' | 'white';
}

export const CopyToClipBoardButton: React.FC<Props> = ({ text, color }) => {
    const [shouldDisplayIsCopied, setShouldDisplayIsCopied] = useState(false);

    const handleClickCopyToClipBoard = useCallback(() => {
        navigator.clipboard.writeText(text);
        setShouldDisplayIsCopied(true);
        setTimeout(() => {
            setShouldDisplayIsCopied(false);
        }, 3000);
    }, [text]);

    const cssClass = classNames({
        'copy-to-clipboard': true,
        buttonRect: true,
        [color]: true,
    });

    return (
        <button className={cssClass} onClick={handleClickCopyToClipBoard}>
            <CopyToClipBoardIcon />
            <p>{shouldDisplayIsCopied ? 'Copied to clipboard' : text}</p>
        </button>
    );
};
