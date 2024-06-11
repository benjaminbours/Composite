'use client';
import React, { useEffect, useState } from 'react';
import { loadImage } from '../../../../../utils';
import { defaultLevelImageUrl } from '../../../../../constants';

interface Props {
    levelId: number;
}

export const LevelImage: React.FC<Props> = ({ levelId }) => {
    const [imageUrl, setImageUrl] = useState(defaultLevelImageUrl);

    useEffect(() => {
        loadImage(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/thumbnails/level_${levelId}_thumbnail.png`,
        )
            .catch(() => defaultLevelImageUrl)
            .then((url) => {
                setImageUrl(url);
            });
    }, [levelId]);

    return (
        <div
            className="level-image"
            style={{
                backgroundImage: `url("${imageUrl}")`,
            }}
        />
    );
};
