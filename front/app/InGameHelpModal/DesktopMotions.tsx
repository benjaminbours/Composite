import React from 'react';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface Props {
    isSoloMode: boolean;
}

export const DesktopMotions: React.FC<Props> = ({ isSoloMode }) => {
    return (
        <div className="desktop-motions">
            <div className="desktop-motions__key-text">
                <span className="keyboard-key">A</span>
                <span className="keyboard-key">D</span>
                <p>Left / right</p>
            </div>
            <div className="desktop-motions__key-text">
                <span className="keyboard-key rotate">⮕</span>
                <span className="keyboard-key">⮕</span>
                <p>Left / right</p>
            </div>

            <div className="desktop-motions__key-text">
                <span className="keyboard-key space">Space</span>
                <p>Jump</p>
            </div>
            {isSoloMode && (
                <div className="desktop-motions__key-text">
                    <span className="keyboard-key">CTRL</span>
                    {` + `}
                    <span className="keyboard-key">O</span>
                    <p>Switch Player</p>
                    <SwitchAccountIcon />
                </div>
            )}
            <div className="desktop-motions__key-text">
                <span className="keyboard-key">BACKSPACE</span>
                <p>Reset position</p>
                <RestartAltIcon />
            </div>
            <div className="desktop-motions__key-text">
                <span className="keyboard-key">F</span>
                <p>Interact while standing on door opener</p>
            </div>
        </div>
    );
};
