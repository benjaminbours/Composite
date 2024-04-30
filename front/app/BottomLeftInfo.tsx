import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';

interface Props {
    gameIsPlaying: boolean;
    onSettingsClick: () => void;
}

export const BottomLeftInfo: React.FC<Props> = ({
    onSettingsClick,
    gameIsPlaying,
}) => {
    return (
        <div className="bottom-left-info">
            {gameIsPlaying && (
                <>
                    <IconButton className="settings" onClick={onSettingsClick}>
                        <SettingsIcon />
                    </IconButton>
                    <p className="version">
                        Blocked? Reset position{' '}
                        <span className="keyboard-key">Backspace</span>
                    </p>
                </>
            )}
            <p className="version">{`Version ${process.env.APP_VERSION}`}</p>
        </div>
    );
};
