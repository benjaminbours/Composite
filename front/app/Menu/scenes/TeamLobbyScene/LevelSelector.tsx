import React, { useEffect, useMemo, useRef, useState } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';
import SlickSlider, { Settings } from 'react-slick';
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
    const [slideIndex, setSlideIndex] = useState(0);
    const sliderRef = useRef<any>(null);

    const next = () => {
        sliderRef.current?.slickNext();
    };
    const previous = () => {
        sliderRef.current?.slickPrev();
    };

    useEffect(() => {
        if (selectedLevel && levels.length > 0) {
            const index = levels.findIndex(
                (level) => level.id === selectedLevel,
            );
            if (index !== -1) {
                setSlideIndex(index);
                handleSelectLevel(selectedLevel);
                console.log(sliderRef.current);

                sliderRef.current?.slickGoTo(index);
            }
        }
    }, [selectedLevel, levels, handleSelectLevel]);

    const settings: Settings = {
        className: styles['carousel-container'],
        centerMode: true,
        focusOnSelect: !disabled,
        infinite: false,
        centerPadding: '20px',
        useTransform: false,
        slidesToShow: 1,
        speed: 500,
        arrows: false,
        draggable: false,
        // waitForAnimate: false,
        beforeChange: function (currentSlide: number, nextSlide: number) {
            const level = levels[nextSlide];
            handleSelectLevel(level.id);
        },
        afterChange: function (currentSlide: number) {
            setSlideIndex(currentSlide);
        },
    };

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

    return (
        <div className="team-lobby-scene__level-container">
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
            <SlickSlider ref={sliderRef} {...settings}>
                {levels.map(({ id, name }) => {
                    return (
                        <LevelPortal
                            name={name}
                            key={id}
                            isSelectedByTeamMate={id === levelSelectedByMate}
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/thumbnails/level_${id}_thumbnail.png`}
                            queueInfo={
                                shouldDisplayQueueInfo
                                    ? queueInfo?.levels[String(id) as any]
                                    : undefined
                            }
                        />
                    );
                })}
            </SlickSlider>
            <div className={styles.controls}>
                <IconButton disabled={disabled} onClick={previous}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Slider
                    disabled={disabled}
                    className={styles.slider}
                    size="small"
                    value={slideIndex}
                    min={0}
                    max={levels.length - 1}
                    onChange={(e, value) => {
                        setSlideIndex(value as number);
                    }}
                    onChangeCommitted={(_, value) => {
                        sliderRef.current?.slickGoTo(value as number);
                    }}
                />
                <IconButton disabled={disabled} onClick={next}>
                    <ArrowForwardIosIcon />
                </IconButton>
            </div>
        </div>
    );
};
