import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import { Route } from '../../../types';

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
    const authorList = useMemo(() => {
        const list = levels.reduce((acc, level) => {
            acc.includes(level.author!.name) || acc.push(level.author!.name);
            return acc;
        }, [] as string[]);
        list.unshift('All');
        return list;
    }, [levels]);
    const [author, setAuthor] = useState<string>(authorList[0]);
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

    const levelsToDisplay = useMemo(() => {
        if (author === 'All') {
            return levels;
        }
        return levels.filter((level) => level.author!.name === author);
    }, [levels, author]);

    const next = useCallback(() => {
        if (slideIndex === levelsToDisplay.length) {
            return;
        }
        setCarouselTransform((prev) => prev + childWidth);
        setSlideIndex((prev) => prev + 1);
        const level = levelsToDisplay[slideIndex];
        if (level) {
            handleSelectLevel(level.id);
        }
    }, [slideIndex, levelsToDisplay, handleSelectLevel]);

    const previous = useCallback(() => {
        if (slideIndex === 1) {
            return;
        }
        setCarouselTransform((prev) => prev - childWidth);
        setSlideIndex((prev) => prev - 1);
        const level = levelsToDisplay[slideIndex - 2];
        if (level) {
            handleSelectLevel(level.id);
        }
    }, [slideIndex, handleSelectLevel, levelsToDisplay]);

    // effect responsible to update the carousel when selected level change
    useEffect(() => {
        if (!selectedLevel) {
            return;
        }
        const index = levelsToDisplay.findIndex(
            (level) => level.id === selectedLevel,
        );
        if (index === -1) {
            return;
        }

        setCarouselTransform((index + 1) * childWidth - childWidth / 2);
        setSlideIndex(index + 1);
    }, [selectedLevel, levelsToDisplay]);

    // effect responsible to update selected level when author change
    useEffect(() => {
        if (author === 'All') {
            return;
        }
        const level = levelsToDisplay[0];
        handleSelectLevel(level.id);
        setSlideIndex(1);
    }, [author, levelsToDisplay, handleSelectLevel]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <h2 className="title-h3 title-h3--white">Select a level</h2>
                <Autocomplete
                    className={styles['author-selector']}
                    disablePortal
                    disabled={disabled}
                    onChange={(_, value) => {
                        setAuthor(value ? (value as string) : 'All');
                    }}
                    includeInputInList
                    value={author}
                    options={authorList}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Author"
                        />
                    )}
                />
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
                <Link
                    href={Route.LEVEL_EDITOR_ROOT}
                    className={styles['header-creator-button']}
                >
                    <button className="buttonRect">Become a creator</button>
                </Link>
                <div className={styles['queue-container']}>
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
                </div>
            </div>

            {levelsToDisplay.length === 0 ? (
                <div className={styles['no-level-container']}>
                    <p>There is no level available so far.</p>
                    <Link href={Route.LEVEL_EDITOR_ROOT}>
                        <button className="buttonRect">
                            Be the first creator!
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="custom-carousel">
                    <ul
                        style={{ left: `calc(50% - ${carouselTransform}px)` }}
                        ref={customCarouselList}
                    >
                        {levelsToDisplay.map(({ id, name }) => {
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
            )}
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
                    max={levelsToDisplay.length}
                    onChange={(e, value) => {
                        setSlideIndex(value as number);
                    }}
                    onChangeCommitted={(_, value) => {
                        setCarouselTransform(
                            (value as number) * childWidth - childWidth / 2,
                        );
                        const level = levelsToDisplay[(value as number) - 1];
                        if (level) {
                            handleSelectLevel(level.id);
                        }
                    }}
                />
                <IconButton disabled={disabled} onClick={next}>
                    <ArrowForwardIosIcon />
                </IconButton>
            </div>
        </div>
    );
};
