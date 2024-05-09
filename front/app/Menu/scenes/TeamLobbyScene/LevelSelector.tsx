import React, { useContext, useEffect, useMemo, useState } from 'react';
// import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import JoinLeftIcon from '@mui/icons-material/JoinLeft';
// import Popper from '@mui/material/Popper';
import styles from './LevelSelector.module.scss';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import { Route } from '../../../types';
import { MainControllerContext } from '../../../MainApp';
import { Side } from '@benjaminbours/composite-core';
import { LobbyMode } from '../../../useMainController';
import classNames from 'classnames';
import { LevelGridItem } from './LevelGridItem';

interface Props {
    disabled?: boolean;
}

export const LevelSelector: React.FC<Props> = ({ disabled }) => {
    const {
        state,
        levels,
        lobbyMode,
        serverCounts,
        handleSelectLevelOnLobby,
        handleClickBackSelectLevel,
        handleMouseLeaveSideButton,
        handleMouseEnterSideButton,
        handleClickSide,
    } = useContext(MainControllerContext);
    // author
    const authorList = useMemo(() => {
        const list = levels.reduce((acc, level) => {
            acc.includes(level.author!.name) || acc.push(level.author!.name);
            return acc;
        }, [] as string[]);
        list.unshift('All');
        return list;
    }, [levels]);
    const [author, setAuthor] = useState<string>(authorList[0]);

    // effect to randomize portal animations
    useEffect(() => {
        document
            .querySelectorAll<HTMLElement>('.level-portal')
            .forEach((portal) => {
                portal.style.setProperty('--x', `${Math.random() * 100 - 50}%`); // Random x between -50% and 50%
                portal.style.setProperty('--y', `${Math.random() * 100 - 50}%`); // Random y between -50% and 50%
            });
    }, []);

    // const progress = useMemo(() => {
    //     return (fetchTime / QUEUE_INFO_FETCH_INTERVAL) * 100;
    // }, [fetchTime]);

    const levelsToDisplay = useMemo(() => {
        // if (author === 'All') {
        //     return levels;
        // }
        // return levels.filter((level) => level.author!.name === author);
        return [
            ...levels,
            ...levels,
            ...levels,
            ...levels,
            ...levels,
            ...levels,
        ];
    }, [levels, author]);

    // effect responsible to update selected level when author change
    // useEffect(() => {
    //     if (author === 'All') {
    //         return;
    //     }
    //     const level = levelsToDisplay[0];
    //     handleSelectLevelOnLobby(level.id);
    //     setSlideIndex(1);
    // }, [author, levelsToDisplay, handleSelectLevelOnLobby]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                {state.you.side === undefined ? (
                    <>
                        <h2 className="title-h3 title-h3--white">
                            Select a level
                        </h2>
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
                        {/* <Link
                    href={Route.LEVEL_EDITOR_ROOT}
                    className={styles['header-creator-button']}
                >
                    <button className="buttonRect">Become a creator</button>
                </Link> */}
                        {/* <div className={styles['queue-container']}>
                    {shouldDisplayQueueInfo && (
                        <IconButton
                            className={styles['queue-fetch-progress']}
                            onClick={fetchServerInfo}
                            title="Refresh server info"
                        >
                            <CircularProgress
                                variant="determinate"
                                size={30}
                                value={progress}
                            />
                        </IconButton>
                    )}
                </div> */}
                    </>
                ) : (
                    <button
                        className="rect-button select-level-button"
                        onClick={handleClickBackSelectLevel}
                    >
                        <ArrowBackIcon />
                        <span>Select another level</span>
                    </button>
                )}
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
                    <ul>
                        {levelsToDisplay.map(({ id, name }, index) => {
                            const isSelectedByTeamMate =
                                state.mate?.level === id;
                            const isSelectedLevel = id === state.you.level;
                            let isLightWaiting = false;
                            let isShadowWaiting = false;
                            if (
                                lobbyMode === LobbyMode.DUO_WITH_RANDOM &&
                                serverCounts &&
                                serverCounts.levels[id] &&
                                serverCounts.levels[id].light_queue > 0
                            ) {
                                isLightWaiting = true;
                            }

                            if (
                                lobbyMode === LobbyMode.DUO_WITH_RANDOM &&
                                serverCounts &&
                                serverCounts.levels[id] &&
                                serverCounts.levels[id].shadow_queue > 0
                            ) {
                                isShadowWaiting = true;
                            }

                            const cssClass = classNames({
                                selected: isSelectedLevel,
                                'selected-light':
                                    isSelectedLevel &&
                                    state.you.side === Side.LIGHT,
                                'selected-shadow':
                                    isSelectedLevel &&
                                    state.you.side === Side.SHADOW,
                                'selected-team-mate-light':
                                    isSelectedByTeamMate &&
                                    state.mate?.side === Side.LIGHT,
                                'selected-team-mate-shadow':
                                    isSelectedByTeamMate &&
                                    state.mate?.side === Side.SHADOW,
                            });

                            return (
                                <li
                                    data-id={id}
                                    key={index}
                                    className={cssClass}
                                >
                                    <LevelGridItem
                                        className="team-lobby-scene__level-portal"
                                        id={id}
                                        name={name}
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/thumbnails/level_${id}_thumbnail.png`}
                                        you={state.you}
                                        mate={state.mate}
                                        handleClickSide={handleClickSide}
                                        handleMouseEnterSide={
                                            handleMouseEnterSideButton
                                        }
                                        handleMouseLeaveSide={
                                            handleMouseLeaveSideButton
                                        }
                                        // isLightWaiting={isLightWaiting}
                                        // isShadowWaiting={isShadowWaiting}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};
