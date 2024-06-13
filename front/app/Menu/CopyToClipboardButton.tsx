import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Props {
    buttonRef?: React.RefObject<HTMLButtonElement>;
    className?: string;
    asyncAction?: () => Promise<any>;
    textToCopy?: string;
    text: string;
    disabled?: boolean;
}

export const CopyToClipBoardButton: React.FC<Props> = ({
    buttonRef,
    className,
    text,
    textToCopy,
    asyncAction,
    disabled,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [shouldDisplayIsCopied, setShouldDisplayIsCopied] = useState(false);

    const handleClickCopyToClipBoard = useCallback(() => {
        const copyToClipboard = (txt: any) => {
            navigator.clipboard.writeText(txt);
            setShouldDisplayIsCopied(true);
            setIsLoading(false);
            setTimeout(() => {
                setShouldDisplayIsCopied(false);
            }, 3000);
        };
        if (asyncAction) {
            setIsLoading(true);
            asyncAction().then(copyToClipboard);
        } else {
            copyToClipboard(textToCopy);
        }
    }, [textToCopy, asyncAction]);

    const cssClass = classNames({
        'copy-to-clipboard': true,
        disabled: disabled,
        'composite-button': true,
        ...(className
            ? {
                  [className]: true,
              }
            : {}),
    });

    return (
        <button
            ref={buttonRef}
            disabled={disabled}
            className={cssClass}
            onClick={handleClickCopyToClipBoard}
        >
            <span>{shouldDisplayIsCopied ? 'Copied to clipboard' : text}</span>
            {isLoading ? (
                <CircularProgress
                    className="copy-to-clipboard__icon"
                    size={20}
                />
            ) : (
                <ContentCopyIcon className="composite-button__end-icon" />
            )}
        </button>
    );
};
