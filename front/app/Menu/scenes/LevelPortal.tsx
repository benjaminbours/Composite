import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

function loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject();
        img.src = url;
    });
}

interface Props {
    className?: string;
    name: string;
    src: string;
    onClick?: () => void;
}

const defaultImageUrl = '/images/crack_the_door.png';

export const LevelPortal: React.FC<Props> = ({
    className,
    name,
    src,
    onClick,
}) => {
    const [imageUrl, setImageUrl] = useState(defaultImageUrl);

    useEffect(() => {
        loadImage(src)
            .catch(() => defaultImageUrl)
            .then((url) => {
                setImageUrl(url);
            });
    }, [src]);

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
