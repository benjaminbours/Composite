import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HathoraCloud } from '@hathora/cloud-sdk-typescript';
import {
    PingEndpoints,
    Region,
} from '@hathora/cloud-sdk-typescript/models/components';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';

type PingEndpointsWithPing = PingEndpoints & { ping: number };

type RegionState = Record<
    Region,
    {
        region: Region;
        isLoading: boolean;
        ping: number;
    }
>;

interface Props {
    selectedRegion: Region | '';
    onChange: (nextValue: Region) => void;
}

export const FLAG_MAP: Record<Region, string> = {
    Dallas: '🇺🇸',
    Chicago: '🇺🇸',
    Seattle: '🇺🇸',
    Los_Angeles: '🇺🇸',
    Washington_DC: '🇺🇸',
    London: '🇬🇧',
    Frankfurt: '🇩🇪',
    Sao_Paulo: '🇧🇷',
    Mumbai: '🇮🇳',
    Singapore: '🇸🇬',
    Tokyo: '🇯🇵',
    Sydney: '🇦🇺',
};

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

export const RegionSelector: React.FC<Props> = ({
    selectedRegion,
    onChange,
}) => {
    const [regions, setRegions] = useState<RegionState>(generateInitialState());

    const isLoading = useMemo(() => {
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
            onChange(sortedRegions[0].region);
        });
    }, [calculatePing, onChange]);

    return (
        <div className="region-selector">
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Region</InputLabel>
                <Select
                    value={selectedRegion}
                    label="Region"
                    onChange={(e) => onChange(e.target.value as Region)}
                    required
                >
                    {Object.values(regions)
                        .sort((a, b) => a.ping - b.ping)
                        .map((region) => (
                            <MenuItem
                                key={region.region}
                                value={region.region}
                                className="region-selector__item"
                            >
                                <span className="region-selector__flag">
                                    {FLAG_MAP[region.region]}
                                </span>
                                <span className="region-selector__name">
                                    {region.region}
                                </span>
                                <span className="region-selector__ping">
                                    {region.isLoading ? (
                                        <CircularProgress
                                            style={{ color: 'white' }}
                                            size={20}
                                        />
                                    ) : (
                                        `${region.ping}ms`
                                    )}
                                </span>
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
            <IconButton
                className="region-selector__refresh"
                disabled={isLoading}
                onClick={calculatePing}
            >
                {isLoading ? (
                    <CircularProgress style={{ color: 'white' }} size={20} />
                ) : (
                    <RefreshIcon />
                )}
            </IconButton>
        </div>
    );
};
