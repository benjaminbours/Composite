import React, { useEffect, useMemo, useRef, useState } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import JoinLeftIcon from '@mui/icons-material/JoinLeft';
import { LevelPortal } from '../LevelPortal';
import { Level } from '@benjaminbours/composite-api-client';
import Popper from '@mui/material/Popper';
import styles from './LevelSelector.module.scss';
import { AllQueueInfo } from '@benjaminbours/composite-core';
import CircularProgress from '@mui/material/CircularProgress';
import { QUEUE_INFO_FETCH_INTERVAL } from '../../Menu';

interface Props {
    levels: Level[];
    disabled?: boolean;
    handleSelectLevel: (levelId: number) => void;
    fetchQueueInfo: () => Promise<void>;
    handleClickOnQueueInfo: () => void;
    shouldDisplayQueueInfo: boolean;
    queueInfo?: AllQueueInfo;
    fetchTime: number;
    levelSelectedByMate?: number;
    selectedLevel?: number;
}

export const LevelSelector: React.FC<Props> = ({
    levels,
    disabled,
    handleSelectLevel,
    fetchQueueInfo,
    shouldDisplayQueueInfo,
    fetchTime,
    levelSelectedByMate,
    queueInfo,
    handleClickOnQueueInfo,
    selectedLevel,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [slideIndex, setSlideIndex] = useState(() => {
        if (selectedLevel && levels.length > 0) {
            const index = levels.findIndex(
                (level) => level.id === selectedLevel,
            );
            return index !== -1 ? index + 1 : 1;
        }
        return 1;
    });

    // effect to randomize portal animations
    useEffect(() => {
        document
            .querySelectorAll<HTMLElement>('.level-portal')
            .forEach((portal) => {
                portal.style.setProperty('--x', `${Math.random() * 100 - 50}%`); // Random x between -50% and 50%
                portal.style.setProperty('--y', `${Math.random() * 100 - 50}%`); // Random y between -50% and 50%
            });
    }, []);

    const progress = useMemo(() => {
        return (fetchTime / QUEUE_INFO_FETCH_INTERVAL) * 100;
    }, [fetchTime]);

    const customCarouselList = useRef<HTMLUListElement>(null);
    const childWidth = 400;
    const [carouselTransform, setCarouselTransform] = useState(childWidth / 2);

    const next = () => {
        if (slideIndex === levels.length) {
            return;
        }
        setCarouselTransform((prev) => prev + childWidth);
        setSlideIndex((prev) => prev + 1);
    };

    const previous = () => {
        if (slideIndex === 1) {
            return;
        }
        setCarouselTransform((prev) => prev - childWidth);
        setSlideIndex((prev) => prev - 1);
    };

    useEffect(() => {
        if (!selectedLevel) {
            return;
        }
        const index = levels.findIndex((level) => level.id === selectedLevel);
        if (index === -1) {
            return;
        }

        setCarouselTransform((index + 1) * childWidth - childWidth / 2);
        setSlideIndex(index + 1);
    }, [selectedLevel, levels]);

    useEffect(() => {
        const level = levels[slideIndex - 1];
        handleSelectLevel(level.id);
    }, [slideIndex, handleSelectLevel, levels]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h2 className="title-h3 title-h3--white">Select a level</h2>
                <button
                    className={styles['queue-info-icon']}
                    onMouseEnter={(event: React.MouseEvent<HTMLElement>) =>
                        setAnchorEl(event.currentTarget)
                    }
                    onMouseLeave={() => setAnchorEl(null)}
                    onClick={handleClickOnQueueInfo}
                >
                    <JoinLeftIcon />
                </button>
                <Popper
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    className={styles['queue-info-popper']}
                    placement="right"
                >
                    <p>
                        {shouldDisplayQueueInfo
                            ? 'Hide matchmaking queue info'
                            : 'Display matchmaking queue info'}
                    </p>
                </Popper>
                {shouldDisplayQueueInfo && (
                    <IconButton
                        className={styles['queue-fetch-progress']}
                        onClick={fetchQueueInfo}
                    >
                        <CircularProgress
                            variant="determinate"
                            size={30}
                            value={progress}
                        />
                    </IconButton>
                )}
            </div>

            <div className="custom-carousel">
                <ul
                    style={{ left: `calc(50% - ${carouselTransform}px)` }}
                    ref={customCarouselList}
                >
                    {levels.map(({ id, name }) => {
                        return (
                            <li key={id}>
                                <LevelPortal
                                    name={name}
                                    isSelectedByYou={id === selectedLevel}
                                    isSelectedByTeamMate={
                                        id === levelSelectedByMate
                                    }
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/thumbnails/level_${id}_thumbnail.png`}
                                    queueInfo={
                                        shouldDisplayQueueInfo
                                            ? queueInfo?.levels[
                                                  String(id) as any
                                              ]
                                            : undefined
                                    }
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className={styles.controls}>
                <IconButton disabled={disabled} onClick={previous}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Slider
                    disabled={disabled}
                    className={styles.slider}
                    size="small"
                    value={slideIndex}
                    min={1}
                    max={levels.length}
                    onChange={(e, value) => {
                        setSlideIndex(value as number);
                    }}
                    onChangeCommitted={(_, value) => {
                        setCarouselTransform(
                            (value as number) * childWidth - childWidth / 2,
                        );
                    }}
                />
                <IconButton disabled={disabled} onClick={next}>
                    <ArrowForwardIosIcon />
                </IconButton>
            </div>
        </div>
    );
};
