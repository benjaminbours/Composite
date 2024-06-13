// vendors
import { Thunk, thunk, Action, action } from 'easy-peasy';
// our libs
import { servicesContainer } from '../../frameworks';
import { ApiClient } from '../../services';
import type { StoreModel } from '../../frameworks/easy-peasy';

export interface ServerCounts {
    playing: number;
    matchmaking: number;
    levels: Record<
        number,
        { playing: number; light_queue: number; shadow_queue: number }
    >;
}

export interface ServerInfoModel {
    // properties
    serverCounts: ServerCounts | undefined;
    timeUntilNextFetch: number;
    // actions
    resetTimeUntilNextFetch: Action<ServerInfoModel>;
    incrementTimeUntilNextFetch: Action<ServerInfoModel, number>;
    setServerCounts: Action<ServerInfoModel, ServerCounts | undefined>;
    clearFetchServerInfo: Action<ServerInfoModel>;
    // thunks
    fetchServerInfo: Thunk<
        ServerInfoModel,
        void,
        any,
        StoreModel,
        Promise<void>
    >;
}

export const QUEUE_INFO_FETCH_INTERVAL = 20000;

let queueInfoIntervalId: NodeJS.Timeout | undefined;
let fetchCompletionIntervalId: NodeJS.Timeout | undefined;

export const serverInfoModel: ServerInfoModel = {
    // properties
    serverCounts: undefined,
    timeUntilNextFetch: 0,
    // actions
    resetTimeUntilNextFetch: action((state) => {
        state.timeUntilNextFetch = 0;
    }),
    incrementTimeUntilNextFetch: action((state, payload) => {
        state.timeUntilNextFetch += payload;
    }),
    setServerCounts: action((state, payload) => {
        state.serverCounts = payload;
    }),
    clearFetchServerInfo: action(() => {
        clearInterval(queueInfoIntervalId);
        clearInterval(fetchCompletionIntervalId);
        queueInfoIntervalId = undefined;
        fetchCompletionIntervalId = undefined;
    }), // thunks
    fetchServerInfo: thunk(async (actions, _payload) => {
        // inject services
        const apiClient = servicesContainer.get(ApiClient);
        apiClient.defaultApi.appControllerGetServerInfo().then((data) => {
            // clear previous interval
            clearInterval(queueInfoIntervalId);
            clearInterval(fetchCompletionIntervalId);
            const intervalId = setInterval(() => {
                actions.fetchServerInfo();
            }, QUEUE_INFO_FETCH_INTERVAL);

            actions.resetTimeUntilNextFetch();
            const completionIntervalId = setInterval(() => {
                actions.incrementTimeUntilNextFetch(1000);
            }, 1000);

            fetchCompletionIntervalId = completionIntervalId;
            queueInfoIntervalId = intervalId;

            // update states
            const serverCounts = data.reduce(
                (acc, player) => {
                    if (
                        player &&
                        player.selectedLevel !== undefined &&
                        player.side !== undefined
                    ) {
                        if (!acc.levels[player.selectedLevel]) {
                            acc.levels[player.selectedLevel] = {
                                playing: 0,
                                light_queue: 0,
                                shadow_queue: 0,
                            };
                        }

                        if (player.status === 0) {
                            acc.playing++;
                            acc.levels[player.selectedLevel].playing++;
                        } else if (player.status === 1) {
                            acc.matchmaking++;

                            if (player.side === 0) {
                                acc.levels[player.selectedLevel].shadow_queue++;
                            } else {
                                acc.levels[player.selectedLevel].light_queue++;
                            }
                        }
                    }
                    return acc;
                },
                {
                    playing: 0,
                    matchmaking: 0,
                    levels: {},
                } as ServerCounts,
            );

            actions.setServerCounts(serverCounts);
        });
    }),
};
