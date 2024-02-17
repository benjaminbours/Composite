// vendors
import React, { useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CameraIcon from '@mui/icons-material/Camera';
import { Divider } from '@mui/material';
import { DropDownMenu } from './DropDownMenu';

interface Props {
    onResetCamera: () => void;
    onToggleCollisionArea: () => void;
    onStartTestMode: () => void;
    onResetPlayersPosition: () => void;
}

export const TopBar: React.FC<Props> = ({
    onResetCamera,
    onToggleCollisionArea,
    onStartTestMode,
    onResetPlayersPosition,
}) => {
    const actionItems = useMemo(() => {
        return [
            {
                icon: <VisibilityIcon fontSize="small" />,
                text: 'Display collision area',
                onClick: onToggleCollisionArea,
            },
            {
                icon: <CameraIcon fontSize="small" />,
                text: 'Reset camera',
                onClick: onResetCamera,
            },
            {
                icon: <SportsEsportsIcon fontSize="small" />,
                text: 'Test / Play',
                onClick: onStartTestMode,
            },
            {
                icon: <RestartAltIcon fontSize="small" />,
                text: 'Reset players position',
                onClick: onResetPlayersPosition,
            },
        ];
    }, [
        onResetCamera,
        onToggleCollisionArea,
        onStartTestMode,
        onResetPlayersPosition,
    ]);

    return (
        <AppBar className="level-builder__app-bar top-bar" position="static">
            <Toolbar className="top-bar__tool-bar">
                <Button size="small" startIcon={<KeyboardArrowLeftIcon />}>
                    Back
                </Button>
                <Divider orientation="vertical" flexItem />
                <DropDownMenu
                    buttonText="Actions"
                    items={actionItems}
                    icon={<KeyboardArrowDownIcon />}
                />
            </Toolbar>
        </AppBar>
    );
};
