import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import Popper from '@mui/material/Popper';
import { Side } from '@benjaminbours/composite-core';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import { PlayerState } from '../../../useMainController';

interface Props {
    levelName: string;
    you: PlayerState;
    mate: PlayerState;
}

export const TeamMateHelper: React.FC<Props> = ({ levelName, you, mate }) => {
    const [open, setOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const mateName = mate.account?.name || 'Guest';
    return (
        <>
            <div className="team-mate-container">
                <div
                    className="team-mate"
                    onMouseEnter={(e) => {
                        setAnchorEl(e.currentTarget);
                        setOpen((previousOpen) => !previousOpen);
                    }}
                    onMouseLeave={() => {
                        setAnchorEl(null);
                        setOpen((previousOpen) => !previousOpen);
                    }}
                >
                    <PersonIcon className="team-mate-icon" />
                    <p>{mateName}</p>
                    {mate.side === Side.LIGHT && <Brightness7Icon />}
                    {mate.side === Side.SHADOW && <ModeNightIcon />}
                </div>
                {mate.side !== undefined && you.side === undefined && (
                    <button className="rect-button align-button">Align</button>
                )}
            </div>
            <Popper
                id="team-mate-helper"
                open={open}
                anchorEl={anchorEl}
                placement="bottom"
                disablePortal
            >
                <p className="team-mate-help-text">
                    <b>Team mate:</b> {mateName} <br />
                    <b>Level:</b> {levelName}
                    <br />
                    <b>Side:</b> {mate.side === Side.LIGHT && 'Light'}
                    {mate.side === Side.SHADOW && 'Shadow'}
                    <br />
                </p>
            </Popper>
        </>
    );
};
