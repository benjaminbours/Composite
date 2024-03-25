import React from 'react';
import Link from 'next/link';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import { Route } from './types';

interface Props {
    onSettingsClick: () => void;
}

export const BottomRightInfo: React.FC<Props> = ({ onSettingsClick }) => {
    return (
        <div className="bottom-right-info">
            {/* <IconButton className="settings" onClick={onSettingsClick}>
                <SettingsIcon />
            </IconButton>
            <Link href={Route.ROADMAP} className="inline-link">
                Roadmap
            </Link> */}
            <p className="version">{`Version ${process.env.APP_VERSION}`}</p>
        </div>
    );
};
