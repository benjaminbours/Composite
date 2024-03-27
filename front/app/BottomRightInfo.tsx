import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';

interface Props {
    gameIsPlaying: boolean;
    onSettingsClick: () => void;
}

export const BottomRightInfo: React.FC<Props> = ({
    onSettingsClick,
    gameIsPlaying,
}) => {
    return (
        <div className="bottom-right-info">
            {gameIsPlaying && (
                <IconButton className="settings" onClick={onSettingsClick}>
                    <SettingsIcon />
                </IconButton>
            )}
            <p className="version">{`Version ${process.env.APP_VERSION}`}</p>
        </div>
    );
};
