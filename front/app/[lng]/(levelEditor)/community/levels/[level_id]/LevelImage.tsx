'use client';
import React, { useMemo } from 'react';
import { defaultLevelImageUrl } from '../../../../../constants';

interface Props {
    levelId: number;
    thumbnail?: string;
}

export const LevelImage: React.FC<Props> = ({ thumbnail }) => {
    const imageUrl = useMemo(() => {
        if (thumbnail) {
            return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/level_thumbnails/${thumbnail}`;
        }
        return defaultLevelImageUrl;
    }, [thumbnail]);

    return (
        <div
            className="level-image"
            style={{
                backgroundImage: `url("${imageUrl}")`,
            }}
        />
    );
};
