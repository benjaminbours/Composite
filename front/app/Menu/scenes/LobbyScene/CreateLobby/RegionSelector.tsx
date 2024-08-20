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
// local
import { RegionState } from '../../../../contexts/useCalculatePing';

const FLAG_MAP: Record<Region, string> = {
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

interface Props {
    regions: RegionState;
    selectedRegion: Region | '';
    onChange: (nextValue: Region) => void;
    calculatePing: () => void;
    isCalculatingPing: boolean;
}

export const RegionSelector: React.FC<Props> = ({
    regions,
    selectedRegion,
    onChange,
    calculatePing,
    isCalculatingPing,
}) => {
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
                disabled={isCalculatingPing}
                onClick={calculatePing}
            >
                {isCalculatingPing ? (
                    <CircularProgress style={{ color: 'white' }} size={20} />
                ) : (
                    <RefreshIcon />
                )}
            </IconButton>
        </div>
    );
};
