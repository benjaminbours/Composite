import React, { useContext, useMemo, useState } from 'react';
import styles from './LevelSelector.module.scss';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import { Route } from '../../../types';
import { MainControllerContext } from '../../../MainApp';
import {
    LobbyMode,
    QUEUE_INFO_FETCH_INTERVAL,
} from '../../../useMainController';
import { LevelGridItem } from './LevelGridItem';
import CircularProgress from '@mui/material/CircularProgress';
import { useStoreActions, useStoreState } from '../../../hooks/store';

interface Props {
    disabled?: boolean;
    isMobile: boolean;
}

export const LevelSelector: React.FC<Props> = ({ disabled, isMobile }) => {
    const {
        state,
        levels,
        lobbyMode,
        handleMouseLeaveSideButton,
        handleMouseEnterSideButton,
        handleClickLevelItem,
    } = useContext(MainControllerContext);

    const serverCounts = useStoreState(
        (state) => state.serverInfo.serverCounts,
    );
    const fetchTime = useStoreState(
        (state) => state.serverInfo.timeUntilNextFetch,
    );
    const fetchServerInfo = useStoreActions(
        (actions) => actions.serverInfo.fetchServerInfo,
    );

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

    const progress = useMemo(() => {
        return (fetchTime / QUEUE_INFO_FETCH_INTERVAL) * 100;
    }, [fetchTime]);

    const levelsToDisplay = useMemo(() => {
        if (author === 'All') {
            return levels;
        }
        return levels.filter((level) => level.author!.name === author);
    }, [levels, author]);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <>
                    <h2 className="title-h3 title-h3--important">
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
                    {!isMobile && (
                        <Link href={Route.LEVEL_EDITOR_ROOT}>
                            <button className="composite-button composite-button--small">
                                Become a creator
                            </button>
                        </Link>
                    )}
                    {lobbyMode === LobbyMode.DUO_WITH_RANDOM && (
                        <div className={styles['queue-container']}>
                            {/* TODO: Fix position on mobile */}
                            <button
                                className="composite-button composite-button--small refresh-queue-button"
                                onClick={() => {
                                    fetchServerInfo();
                                }}
                            >
                                {!isMobile && 'Refresh queue info'}
                                <CircularProgress
                                    variant="determinate"
                                    size={20}
                                    value={progress}
                                />
                            </button>
                        </div>
                    )}
                </>
            </div>
            {levelsToDisplay.length === 0 ? (
                <div className={styles['no-level-container']}>
                    <p>There is no level available so far.</p>
                    <Link href={Route.LEVEL_EDITOR_ROOT}>
                        <button className="composite-button">
                            Be the first creator!
                        </button>
                    </Link>
                </div>
            ) : (
                <div className={`level-grid ${styles['level-grid']}`}>
                    <ul>
                        {levelsToDisplay.map((level, index) => {
                            const { id, name } = level;
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

                            return (
                                <li data-id={id} key={index}>
                                    <LevelGridItem
                                        level={level}
                                        you={state.you}
                                        mate={state.mate}
                                        handleClick={handleClickLevelItem}
                                        handleMouseEnterSide={
                                            handleMouseEnterSideButton
                                        }
                                        handleMouseLeaveSide={
                                            handleMouseLeaveSideButton
                                        }
                                        isLightWaiting={isLightWaiting}
                                        isShadowWaiting={isShadowWaiting}
                                        isMobile={isMobile}
                                        isSoloMode={
                                            lobbyMode === LobbyMode.SOLO ||
                                            lobbyMode === LobbyMode.PRACTICE
                                        }
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
