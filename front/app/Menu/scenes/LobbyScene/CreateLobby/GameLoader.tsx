import { Level } from '@benjaminbours/composite-core-api-client';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { defaultLevelImageUrl } from '../../../../constants';
import { CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { FlowItem, GameStatus, statusTextMap } from '../../../../contexts';

interface Props {
    level: Level;
    // gameStatus: Exclude<GameStatus, GameStatus.IDLE>;
    loadingFlow: FlowItem[];
    loadingStep: number;
}

export const GameLoader: React.FC<Props> = ({
    level,
    loadingStep,
    loadingFlow,
}) => {
    const imageUrl = useMemo(() => {
        if (level.thumbnail) {
            return `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/level_thumbnails/${level.thumbnail}`;
        }
        return defaultLevelImageUrl;
    }, [level.thumbnail]);

    return (
        <div className="game-loader">
            <h2 className="title-h3 text-important">{level.name}</h2>
            <Image
                className="game-loader__image"
                src={imageUrl}
                alt={`Thumbnail image for level ${level.id}`}
                width={300}
                height={188}
            />
            {loadingFlow.map(({ id, text }, index) => (
                <div key={id} className="game-loader__row">
                    <div className="game-loader__row-icon">
                        {loadingStep > index && (
                            <CheckCircleOutlineIcon color="success" />
                        )}
                        {loadingStep === index && (
                            <CircularProgress
                                className="game-loader__progress"
                                size={20}
                            />
                        )}
                        {loadingStep < index && (
                            <RadioButtonUncheckedIcon color="disabled" />
                        )}
                    </div>
                    <p>{text}</p>
                </div>
            ))}
        </div>
    );
};
