import { Level } from '@benjaminbours/composite-core-api-client';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { CircularProgress, Divider } from '@mui/material';
import { defaultLevelImageUrl } from '../../../../constants';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { FlowItem, GameStatus, statusTextMap } from '../../../../contexts';
import { DiscordButton } from '../../../../02_molecules/DiscordButton';

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

    const isMobile = window.innerWidth <= 768 || window.innerHeight <= 500;

    return (
        <div className="game-loader">
            <div className="game-loader__loader">
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
            {!isMobile && (
                <div className="game-loader__tips">
                    <h4 className="title-h4 text-important">Tips</h4>
                    <p>
                        {`The minimap at the bottom right provides information about
                        your teammate's position.`}
                    </p>
                    <Divider />
                    <p>{`Any door can be open.`}</p>
                    <Divider />
                    <p>
                        {`It's funnier if you can speak by voice with your teammate.`}
                    </p>
                    <DiscordButton className="composite-button" />
                </div>
            )}
        </div>
    );
};
