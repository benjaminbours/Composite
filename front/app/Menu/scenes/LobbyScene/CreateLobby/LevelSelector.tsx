import React, { useCallback, useMemo, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import { MenuScene, Route } from '../../../../types';
import { QUEUE_INFO_FETCH_INTERVAL } from '../../../../useMainController';
import { LevelGridItem } from '../LevelGridItem';
import CircularProgress from '@mui/material/CircularProgress';
import { GamePlayerCount, Side } from '@benjaminbours/composite-core';
import type { Level } from '@benjaminbours/composite-core-api-client';
import { useMenuTransitionContext } from '../../../../contexts/menuTransitionContext';

interface Props {
    levels: Level[];
    playerNumber: GamePlayerCount;
    selectedLevel: number;
    selectedSide?: Side;
    onChange: (newValue: [levelId: number, side?: Side]) => void;
    disabled?: boolean;
    isMobile: boolean;
    isLoading: boolean;
}

export const LevelSelector: React.FC<Props> = ({
    levels,
    playerNumber,
    selectedLevel,
    selectedSide,
    onChange,
    disabled,
    isMobile,
    isLoading,
}) => {
    const { setLightIsPulsingFast, setShadowRotationSpeed, handleSideButton } =
        useMenuTransitionContext();

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

    // const progress = useMemo(() => {
    //     return (fetchTime / QUEUE_INFO_FETCH_INTERVAL) * 100;
    // }, [fetchTime]);

    const levelsToDisplay = useMemo(() => {
        if (author === 'All') {
            return levels;
        }
        return levels.filter((level) => level.author!.name === author);
    }, [levels, author]);

    // TODO: Should be moved into menu transition context
    const handleClickLevelItem = useCallback(
        (levelId: number) => (e: React.MouseEvent) => {
            const targetClassList = (e.target as HTMLElement).classList;
            let side: Side | undefined = undefined;
            if (targetClassList.contains('half-circle--light')) {
                side = Side.LIGHT;
            } else if (targetClassList.contains('half-circle--shadow')) {
                side = Side.SHADOW;
            }

            const isDesktop =
                window.innerWidth > 768 && window.innerHeight > 500;
            if (
                playerNumber === GamePlayerCount.DUO &&
                side === undefined &&
                isDesktop
            ) {
                return;
            }

            const yingYang =
                e.currentTarget.parentElement?.querySelector('.ying-yang');
            if (!yingYang) {
                return;
            }

            const ying = yingYang.querySelector<SVGPathElement>('.white');
            if (ying) {
                ying.classList.remove('visible');
            }
            const yang = yingYang.querySelector<SVGPathElement>('.black');
            if (yang) {
                yang.classList.remove('visible');
            }

            // graphic update
            if (side === Side.LIGHT) {
                setLightIsPulsingFast(false);
            } else {
                setShadowRotationSpeed(0.005);
            }

            // // state update
            // setState((prev) => ({
            //     ...prev,
            //     you: {
            //         ...prev.you,
            //         level: levelId,
            //         side: side,
            //         isReady: false,
            //     },
            // }));

            // setProperty({ field: 'levelId', value: levelId });
            onChange([levelId, side]);

            // // network update
            // // TODO: Send in one batch
            // socketController.current?.emit([
            //     SocketEventLobby.SELECT_LEVEL,
            //     levelId,
            // ]);
            // socketController.current?.emit([
            //     SocketEventLobby.SELECT_SIDE,
            //     side,
            // ]);

            // if (lobbyMode === LobbyMode.DUO_WITH_RANDOM && side !== undefined) {
            //     handleEnterRandomQueue(side, levelId);
            // }
        },
        [
            onChange,
            playerNumber,
            setShadowRotationSpeed,
            setLightIsPulsingFast,
            // handleEnterRandomQueue,
        ],
    );

    // TODO: Can be improved and optimized
    const main = useMemo(() => {
        // TODO: Load until the images has been loaded as well
        if (isLoading) {
            return (
                <div className="level-selector__no-level">
                    <p>Loading the levels</p>
                    <CircularProgress style={{ color: 'white' }} />
                </div>
            );
        } else if (levelsToDisplay.length === 0) {
            return (
                <div className="level-selector__no-level">
                    <p>There is no level available so far.</p>
                    <Link href={Route.LEVEL_EDITOR_ROOT}>
                        <button className="composite-button">
                            Be the first creator!
                        </button>
                    </Link>
                </div>
            );
        } else {
            return (
                <div className="level-grid">
                    <ul>
                        {levelsToDisplay.map((level, index) => {
                            const { id, name } = level;
                            let isLightWaiting = false;
                            let isShadowWaiting = false;

                            // if (
                            //     lobbyMode === LobbyMode.DUO_WITH_RANDOM &&
                            //     serverCounts &&
                            //     serverCounts.levels[id] &&
                            //     serverCounts.levels[id].light_queue > 0
                            // ) {
                            //     isLightWaiting = true;
                            // }

                            // if (
                            //     lobbyMode === LobbyMode.DUO_WITH_RANDOM &&
                            //     serverCounts &&
                            //     serverCounts.levels[id] &&
                            //     serverCounts.levels[id].shadow_queue > 0
                            // ) {
                            //     isShadowWaiting = true;
                            // }

                            return (
                                <LevelGridItem
                                    key={index}
                                    level={level}
                                    // you={state.you}
                                    // mate={state.mate}
                                    handleClick={handleClickLevelItem}
                                    handleSideButton={handleSideButton}
                                    isSelected={selectedLevel === id}
                                    selectedSide={selectedSide}
                                    isLightWaiting={isLightWaiting}
                                    isShadowWaiting={isShadowWaiting}
                                    isMobile={isMobile}
                                    isSoloMode={
                                        playerNumber === GamePlayerCount.SOLO
                                    }
                                />
                            );
                        })}
                    </ul>
                </div>
            );
        }
    }, [
        isLoading,
        levelsToDisplay,
        handleClickLevelItem,
        handleSideButton,
        isMobile,
        selectedLevel,
        selectedSide,
        playerNumber,
    ]);

    return (
        <div className="level-selector">
            <div className="level-selector__header">
                <h2 className="title-h3 text-important">Level</h2>
                <Autocomplete
                    className="level-selector__author"
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
                {/* {lobbyMode === LobbyMode.DUO_WITH_RANDOM && (
                        <div className={styles['queue-container']}>
                            <button
                                className="composite-button composite-button--small refresh-queue-button"
                                // onClick={() => {
                                //     fetchServerInfo();
                                // }}
                            >
                                {!isMobile && 'Refresh queue info'}
                                <CircularProgress
                                    variant="determinate"
                                    size={20}
                                    value={progress}
                                />
                            </button>
                        </div>
                    )} */}
            </div>
            {main}
        </div>
    );
};
