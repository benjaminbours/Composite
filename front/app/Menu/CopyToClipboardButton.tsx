import React, { useCallback, useState } from 'react';
import { CopyToClipBoardIcon } from './CopyToClipboardIcon';

interface Props {
    text: string;
}

export const CopyToClipBoardButton: React.FC<Props> = ({ text }) => {
    const [shouldDisplayIsCopied, setShouldDisplayIsCopied] = useState(false);

    const handleClickCopyToClipBoard = useCallback(() => {
        navigator.clipboard.writeText(process.env.NEXT_PUBLIC_URL!);
        setShouldDisplayIsCopied(true);
        setTimeout(() => {
            setShouldDisplayIsCopied(false);
        }, 3000);
    }, []);

    return (
        <button
            className="copy-to-clipboard buttonRect black"
            onClick={handleClickCopyToClipBoard}
        >
            <CopyToClipBoardIcon color="black" />
            <p>{shouldDisplayIsCopied ? 'Copied to clipboard' : text}</p>
        </button>
    );
};
