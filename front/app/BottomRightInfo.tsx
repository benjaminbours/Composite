import React from 'react';
import Link from 'next/link';
import { CogWheel } from './Game/icons/CogWheel';
import { Route } from './types';

interface Props {
    onSettingsClick: () => void;
}

export const BottomRightInfo: React.FC<Props> = ({ onSettingsClick }) => {
    return (
        <div className="bottom-right-info">
            <button className="settings" onClick={onSettingsClick}>
                <CogWheel />
            </button>
            <Link href={Route.ROADMAP} className="inline-link">
                Roadmap
            </Link>
            <p className="version">{`Version ${process.env.APP_VERSION}`}</p>
        </div>
    );
};
