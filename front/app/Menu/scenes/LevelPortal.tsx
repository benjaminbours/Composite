import classNames from 'classnames';
import React, { useMemo } from 'react';
import { defaultLevelImageUrl } from '../../constants';

interface Props {
    className?: string;
    thumbnail?: string;
    name: string;
    src?: string;
    onClick?: () => void;
}

export const LevelPortal: React.FC<Props> = ({
    className,
    name,
    thumbnail,
    src,
    onClick,
}) => {
    const imageUrl = useMemo(() => {
        if (src) {
            return src;
        }
        if (thumbnail) {
            return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/level_thumbnails/${thumbnail}`;
        }
        return defaultLevelImageUrl;
    }, [thumbnail, src]);

    const cssClass = classNames({
        'level-portal': true,
        ...(className ? { [className]: true } : {}),
    });

    return (
        <div className={cssClass} onClick={onClick}>
            <div className="level-portal__graphic-wrapper">
                <div
                    className="level-portal__image-container"
                    style={{ backgroundImage: `url("${imageUrl}")` }}
                />
                <div className="level-portal__border-container">
                    <div />
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
            </div>
            <p>{name}</p>
        </div>
    );
};
