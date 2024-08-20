// vendors
import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import {
    PingEndpoints,
    Region,
} from '@hathora/cloud-sdk-typescript/models/components';
import { useState, useMemo, useCallback, useEffect } from 'react';

export type PingEndpointsWithPing = PingEndpoints & { ping: number };

export type RegionState = Record<
    Region,
    {
        region: Region;
        isLoading: boolean;
        ping: number;
    }
>;

const generateInitialState = () => {
    return Object.values(Region).reduce((acc, region) => {
        acc[region] = {
            region,
            ping: 0,
            isLoading: true,
        };
        return acc;
    }, {} as RegionState);
};

export function useCalculatePing(setRegion: any) {
    const [regions, setRegions] = useState<RegionState>(generateInitialState());

    const isCalculatingPing = useMemo(() => {
        return Object.values(regions).some((region) => region.isLoading);
    }, [regions]);

    const calculatePing = useCallback(() => {
        setRegions(generateInitialState());
        const hathoraCloud = new HathoraCloud({
            appId: process.env.NEXT_PUBLIC_HATHORA_APP_ID,
        });
        return hathoraCloud.discoveryV2
            .getPingServiceEndpoints()
            .then((regions) => {
                return Promise.all(
                    regions.map(async (region) => {
                        return new Promise<PingEndpointsWithPing>((resolve) => {
                            const url = `wss://${region.host}:${region.port}/ws`;
                            let startTime: number;
                            let endTime: number;

                            // Create a new WebSocket instance
                            const socket = new WebSocket(url);

                            // WebSocket event listeners
                            socket.onopen = () => {
                                // You can perform any necessary actions after the connection is opened
                                startTime = Date.now();
                                socket.send('ping');
                            };

                            socket.onmessage = (event) => {
                                if (event.data !== 'ping') {
                                    return;
                                }
                                endTime = Date.now();
                                const ping = endTime - startTime;
                                socket.close();
                                resolve({
                                    ...region,
                                    ping,
                                });
                            };
                        }).then((region) => {
                            // region
                            setRegions((prev) => {
                                const next = { ...prev };
                                next[region.region] = {
                                    ...next[region.region],
                                    ping: region.ping,
                                    isLoading: false,
                                };
                                return next;
                            });
                            return region;
                        });
                    }),
                );
            });
    }, []);

    useEffect(() => {
        calculatePing().then((regions) => {
            const sortedRegions = regions.sort((a, b) => a.ping - b.ping);
            setRegion(sortedRegions[0].region);
        });
    }, [calculatePing, setRegion]);

    return {
        regions,
        isCalculatingPing,
        calculatePing,
    };
}
