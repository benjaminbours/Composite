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
import { Level } from '@benjaminbours/composite-core-api-client';
// local
import {
    PingEndpointsWithPing,
    RegionState,
    useCalculatePing,
} from './useCalculatePing';
import { useFetchLevels } from './useFetchLevels';
import {
    GameMode,
    GamePlayerNumber,
    GameVisibility,
    LobbyParameters,
} from '../core/entities';
import { useGlobalContext } from './globalContext';

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
            GamePlayerNumber.SOLO,
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
                    nextState.playerNumber = GamePlayerNumber.SOLO;
                    nextState.visibility = GameVisibility.PRIVATE;
                }

                if (
                    field === 'playerNumber' &&
                    newValue === GamePlayerNumber.SOLO
                ) {
                    nextState.visibility = GameVisibility.PRIVATE;
                }

                if (
                    field === 'playerNumber' &&
                    newValue === GamePlayerNumber.DUO
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
