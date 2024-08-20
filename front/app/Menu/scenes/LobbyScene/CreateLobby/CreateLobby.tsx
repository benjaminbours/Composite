// vendors
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GamesIcon from '@mui/icons-material/Games';
// import { useSearchParams } from 'next/navigation';
// ours libs
// local
import { CustomSwitch } from '../CustomSwitch';
import { useWindowSize } from '../../../../hooks/useWindowSize';
import {
    GameMode,
    GamePlayerNumber,
    GameVisibility,
    LobbyParameters,
} from '../../../../core/entities/LobbyParameters';
import { RegionSelector } from './RegionSelector';
import { LevelSelector } from './LevelSelector';
import { GameLoader } from './GameLoader';
import { useGlobalContext } from '../../../../contexts';
import { useMenuDataContext } from '../../../../contexts/menuDataContext';

interface Props {}

export const CreateLobby: React.FC<Props> = ({}) => {
    // hooks
    const { createGame, loadingFlow, loadingStep } = useGlobalContext();

    const {
        region,
        regions,
        isCalculatingPing,
        calculatePing,
        levels,
        isLoadingLevels,
    } = useMenuDataContext();
    const { width, height } = useWindowSize();
    // const queryParams = useSearchParams();

    const isMobile = useMemo(
        () =>
            width !== undefined &&
            height !== undefined &&
            (width <= 768 || height <= 500),
        [width, height],
    );

    // local state
    const [state, setState] = useState(
        new LobbyParameters(
            GameMode.RANKED,
            GamePlayerNumber.SOLO,
            0,
            GameVisibility.PUBLIC,
            region,
        ),
    );

    useEffect(() => {
        setState((prev) => ({
            ...prev,
            region,
        }));
    }, [region]);

    const handleChange = useCallback(
        (field: keyof LobbyParameters) => (newValue: any) => {
            if (loadingFlow.length > 0) {
                return;
            }
            setState((prevState) => ({
                ...prevState,
                [field]: newValue,
            }));
        },
        [loadingFlow],
    );

    const handleChangeRegion = useMemo(
        () => handleChange('region'),
        [handleChange],
    );

    const handleSubmit = useCallback(() => {
        createGame(state);
    }, [state, createGame]);

    // // TODO: add params side in the url as well or at a state level selected without any side yet
    // useEffect(() => {
    //     const levelId = Number(queryParams.get('level'));

    //     if (levels.length === 0 || Number.isNaN(levelId) || levelId === 0) {
    //         return;
    //     }
    //     // setState((prev) => ({
    //     //     ...prev,
    //     //     you: {
    //     //         ...prev.you,
    //     //         level: levelId,
    //     //     },
    //     // }));
    //     // socketController.current?.emit([
    //     //     SocketEventLobby.SELECT_LEVEL,
    //     //     levelId,
    //     // ]);
    // }, [levels, queryParams]);

    const selectedLevel = useMemo(
        () => levels.find((l) => l.id === state.levelId),
        [levels, state.levelId],
    );

    return (
        <div className="create-game">
            <div className="create-game__row">
                {/* TODO: Add a disable state for the whole switch */}
                <CustomSwitch
                    selectedValue={state.mode}
                    onChange={handleChange('mode')}
                    items={[
                        {
                            text: 'Practice',
                            value: GameMode.PRACTICE,
                        },
                        {
                            text: 'Ranked',
                            value: GameMode.RANKED,
                        },
                    ]}
                />
                <CustomSwitch
                    selectedValue={state.playerNumber}
                    onChange={handleChange('playerNumber')}
                    items={[
                        {
                            text: 'Solo',
                            value: GamePlayerNumber.SOLO,
                        },
                        {
                            text: 'Duo',
                            value: GamePlayerNumber.DUO,
                            disabled: state.mode === GameMode.PRACTICE,
                        },
                    ]}
                />
                {state.playerNumber === GamePlayerNumber.DUO &&
                    width !== undefined &&
                    width > 768 && (
                        <CustomSwitch
                            selectedValue={
                                state.visibility || GameVisibility.PUBLIC
                            }
                            onChange={handleChange('visibility')}
                            items={[
                                {
                                    text: 'Public',
                                    value: GameVisibility.PUBLIC,
                                },
                                {
                                    text: 'Private',
                                    value: GameVisibility.PRIVATE,
                                },
                            ]}
                        />
                    )}
            </div>
            {state.playerNumber === GamePlayerNumber.DUO &&
                width !== undefined &&
                width <= 768 && (
                    <div className="create-game__row">
                        <CustomSwitch
                            selectedValue={
                                state.visibility || GameVisibility.PUBLIC
                            }
                            onChange={handleChange('visibility')}
                            items={[
                                {
                                    text: 'Public',
                                    value: GameVisibility.PUBLIC,
                                },
                                {
                                    text: 'Private',
                                    value: GameVisibility.PRIVATE,
                                },
                            ]}
                        />
                    </div>
                )}
            {state.mode === GameMode.RANKED && (
                <div className="create-game__row">
                    <RegionSelector
                        selectedRegion={state.region}
                        onChange={handleChangeRegion}
                        regions={regions}
                        calculatePing={calculatePing}
                        isCalculatingPing={isCalculatingPing}
                    />
                </div>
            )}
            {loadingFlow.length > 0 && selectedLevel ? (
                <GameLoader
                    level={selectedLevel}
                    loadingFlow={loadingFlow}
                    loadingStep={loadingStep}
                />
            ) : (
                <LevelSelector
                    levels={levels}
                    isLoading={isLoadingLevels}
                    isMobile={isMobile}
                    selectedLevel={state.levelId}
                    onChange={handleChange('levelId')}
                    playerNumber={state.playerNumber}
                    // disabled={state.isInQueue}
                />
            )}
            {loadingFlow.length === 0 && (
                <button
                    className="create-game__submit-button composite-button"
                    onClick={handleSubmit}
                >
                    Create
                    <GamesIcon className="composite-button__end-icon" />
                </button>
            )}
        </div>
    );
};
