import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import { Socials } from './02_molecules/Socials';

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
                        Stuck? Reset position{' '}
                        <span className="keyboard-key">Backspace</span>
                    </p>
                </>
            )}
            <footer>
                <p className="version">{`Version ${process.env.APP_VERSION}`}</p>
                <Socials className="bottom-left-info__socials" />
            </footer>
        </div>
    );
};
