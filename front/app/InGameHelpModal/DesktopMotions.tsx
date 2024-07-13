import React from 'react';

interface Props {}

export const DesktopMotions: React.FC<Props> = ({}) => {
    return (
        <div className="game-sync-overlay__motions">
            <h4 className="title-h4">Default motions</h4>
            <div>
                <span className="keyboard-key">A</span>
                <span className="keyboard-key">D</span>
            </div>
            <div>
                <span className="keyboard-key rotate">⮕</span>
                <span className="keyboard-key">⮕</span>
            </div>
            <span className="keyboard-key space">Space</span>
        </div>
    );
};
