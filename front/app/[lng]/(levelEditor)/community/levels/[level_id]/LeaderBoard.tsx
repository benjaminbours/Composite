'use client';
import React, { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
    GameModeEnum,
    GameStatusEnum,
    Level,
} from '@benjaminbours/composite-api-client';

interface Props {
    level: Level;
}

export const LeaderBoard: React.FC<Props> = ({ level }) => {
    const [selectedGameMode, setSelectedGameMode] = useState(0);

    const rows = useMemo(() => {
        return level.games
            ?.filter((game) => {
                const isGameFinished = game.status === GameStatusEnum.Finished;
                const isGameMode =
                    selectedGameMode === 0
                        ? game.mode === GameModeEnum.SinglePlayer
                        : game.mode === GameModeEnum.MultiPlayer;
                return isGameFinished && isGameMode;
            })
            .sort((a, b) => a.duration - b.duration);
    }, [level, selectedGameMode]);

    const handleChangeGameMode = useCallback((_e: any, value: any) => {
        setSelectedGameMode(value);
    }, []);

    return (
        <div className="leaderboard">
            <div className="leaderboard__header">
                <h2 className="title-h2">Ranking table</h2>
                <Tabs
                    className="team-lobby-scene__tabs"
                    value={selectedGameMode}
                    textColor="inherit"
                    variant="scrollable"
                    scrollButtons="auto"
                    onChange={handleChangeGameMode}
                >
                    <Tab label="Solo" />
                    <Tab label="Multiplayer" />
                </Tabs>
            </div>
            <table className="leaderboard__table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Time</th>
                        {selectedGameMode === 0 ? (
                            <th>User</th>
                        ) : (
                            <>
                                <th>Shadow</th>
                                <th>Light</th>
                            </>
                        )}
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {rows?.map((row, index) => {
                        const rank = index + 1;
                        const date = dayjs(row.createdAt).format('DD/MM/YYYY');
                        return (
                            <tr key={rank}>
                                <td className="leaderboard__rank-cell">
                                    {rank}
                                </td>
                                <td>
                                    <b>{`${row.duration.toFixed(3)}`} </b>
                                    <span>sec</span>
                                </td>
                                {row.mode === GameModeEnum.SinglePlayer && (
                                    <td>{row.players![0].user?.name}</td>
                                )}
                                {row.mode === GameModeEnum.MultiPlayer && (
                                    <>
                                        <td>{row.players![1].user?.name}</td>
                                        <td>{row.players![0].user?.name}</td>
                                    </>
                                )}
                                <td>{date}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
