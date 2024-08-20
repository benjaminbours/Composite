'use client';
// vendors
import {
    useCallback,
    useContext,
    useState,
    createContext,
    useEffect,
} from 'react';
import { Region } from '@hathora/cloud-sdk-typescript/models/components';
// ours libs
import {
    Level,
    LevelStatusEnum,
    UpsertRatingDtoTypeEnum,
} from '@benjaminbours/composite-core-api-client';
// local
import {
    PingEndpointsWithPing,
    RegionState,
    useCalculatePing,
} from './useCalculatePing';
import { servicesContainer } from '../core/frameworks';
import { CoreApiClient } from '../core/services';
import { computeLevelRatings } from '../utils/game';

interface MenuDataContext {
    // regions
    region: Region | '';
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
    const [levels, setLevels] = useState<Level[]>([]);
    const [isLoadingLevels, setIsLoadingLevels] = useState(false);
    const [region, setRegion] = useState<Region | ''>('');

    const { calculatePing, regions, isCalculatingPing } =
        useCalculatePing(setRegion);

    const fetchLevels = useCallback(async () => {
        const apiClient = servicesContainer.get(CoreApiClient);
        return apiClient.defaultApi
            .levelsControllerFindAll({
                status: LevelStatusEnum.Published,
                stats: 'true',
            })
            .then((levels) => {
                return levels
                    .map((level) => {
                        const ratings = computeLevelRatings(level);
                        const qualityRating = ratings.find(
                            (rating) =>
                                rating.type === UpsertRatingDtoTypeEnum.Quality,
                        );
                        const difficultyRating = ratings.find(
                            (rating) =>
                                rating.type ===
                                UpsertRatingDtoTypeEnum.Difficulty,
                        );
                        return {
                            ...level,
                            qualityRating: qualityRating
                                ? qualityRating.total / qualityRating.length
                                : 0,
                            difficultyRating: difficultyRating
                                ? difficultyRating.total /
                                  difficultyRating.length
                                : 0,
                        };
                    })
                    .sort((a, b) => {
                        return a.difficultyRating - b.difficultyRating;
                    });
            });
    }, []);

    useEffect(() => {
        setIsLoadingLevels(true);
        fetchLevels()
            .then((levels) => {
                setLevels(levels);
            })
            .finally(() => {
                setIsLoadingLevels(false);
            });
    }, [fetchLevels]);

    return {
        // regions
        region,
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
