'use client';
// vendors
import {
    useContext,
    useState,
    createContext,
    useCallback,
    useEffect,
} from 'react';
// ours libs
import {
    GameMode,
    GamePlayerCount,
    GameVisibility,
    Side,
} from '@benjaminbours/composite-core';
import { Level } from '@benjaminbours/composite-core-api-client';
// local
import {
    PingEndpointsWithPing,
    RegionState,
    useCalculatePing,
} from './useCalculatePing';
import { useFetchLevels } from './useFetchLevels';
import { useGlobalContext } from './globalContext';
import { Region } from '@hathora/cloud-sdk-typescript/models/components';

export class LobbyParameters {
    constructor(
        public mode: GameMode,
        public playerCount: GamePlayerCount,
        public levelId: number,
        public visibility: GameVisibility,
        public region: Region | '' = '',
        public side?: Side,
    ) {}
}

interface MenuDataContext {
    state: LobbyParameters;
    handleChange: (field: keyof LobbyParameters) => (newValue: any) => void;
    // regions
    regions: RegionState;
    isCalculatingPing: boolean;
    calculatePing: () => Promise<PingEndpointsWithPing[]>;
    // levels
    isLoadingLevels: boolean;
    levels: Level[];
}

export const MenuDataContext = createContext<MenuDataContext>(
    {} as MenuDataContext,
);

export function useMenuData() {
    const { loadingFlow } = useGlobalContext();

    const [state, setState] = useState(
        new LobbyParameters(
            GameMode.RANKED,
            GamePlayerCount.SOLO,
            0,
            GameVisibility.PRIVATE,
            '',
            undefined,
        ),
    );

    const handleChange = useCallback(
        (field: keyof LobbyParameters) => (newValue: any) => {
            if (loadingFlow.length > 0) {
                return;
            }
            setState((prevState) => {
                const nextState = {
                    ...prevState,
                };

                if (field === 'levelId') {
                    const [levelId, side] = newValue;
                    nextState.levelId = levelId;
                    nextState.side = side;
                } else {
                    (nextState as any)[field] = newValue;
                }

                if (field === 'mode' && newValue === GameMode.PRACTICE) {
                    nextState.playerCount = GamePlayerCount.SOLO;
                    nextState.visibility = GameVisibility.PRIVATE;
                }

                if (
                    field === 'playerCount' &&
                    newValue === GamePlayerCount.SOLO
                ) {
                    nextState.visibility = GameVisibility.PRIVATE;
                }

                if (
                    field === 'playerCount' &&
                    newValue === GamePlayerCount.DUO
                ) {
                    nextState.visibility = GameVisibility.PUBLIC;
                }

                return nextState;
            });
        },
        [loadingFlow],
    );

    const { calculatePing, regions, isCalculatingPing } = useCalculatePing();

    useEffect(() => {
        calculatePing().then((regions) => {
            const sortedRegions = regions.sort((a, b) => a.ping - b.ping);
            setState((prevState) => ({
                ...prevState,
                region: sortedRegions[0].region,
            }));
        });
    }, [calculatePing]);

    const { levels, isLoadingLevels } = useFetchLevels();

    return {
        state,
        handleChange,
        // regions
        regions,
        isCalculatingPing,
        calculatePing,
        // levels
        levels,
        isLoadingLevels,
    };
}

interface MenuDataContextProviderProps {
    children: React.ReactNode;
}

export const MenuDataContextProvider: React.FC<
    MenuDataContextProviderProps
> = ({ children }) => {
    return (
        <MenuDataContext.Provider value={useMenuData()}>
            {children}
        </MenuDataContext.Provider>
    );
};

export const useMenuDataContext = (): MenuDataContext =>
    useContext(MenuDataContext);
