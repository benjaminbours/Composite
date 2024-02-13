// vendors
import React, { useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import SquareIcon from '@mui/icons-material/Square';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CameraIcon from '@mui/icons-material/Camera';
import { ElementType } from './types';
import { Divider } from '@mui/material';
import { DropDownMenu } from './DropDownMenu';

interface Props {
    onLibraryElementClick: (type: ElementType) => void;
    onResetCamera: () => void;
    onToggleCollisionArea: () => void;
    onStartTestMode: () => void;
}

export const TopBar: React.FC<Props> = ({
    onLibraryElementClick,
    onResetCamera,
    onToggleCollisionArea,
    onStartTestMode,
}) => {
    const libraryItems = useMemo(() => {
        return [
            {
                icon: <SquareIcon fontSize="small" />,
                text: 'Wall',
                onClick: () => onLibraryElementClick(ElementType.WALL),
            },
            {
                icon: <SquareIcon fontSize="small" />,
                text: 'Door',
                onClick: () => onLibraryElementClick(ElementType.WALL_DOOR),
            },
            {
                icon: <SquareIcon fontSize="small" />,
                text: 'Door opener',
                onClick: () => onLibraryElementClick(ElementType.DOOR_OPENER),
            },
            {
                icon: <SquareIcon fontSize="small" />,
                text: 'Arch',
                onClick: () => onLibraryElementClick(ElementType.ARCH),
            },
            {
                icon: <SquareIcon fontSize="small" />,
                text: 'Bounce',
                onClick: () => onLibraryElementClick(ElementType.BOUNCE),
            },
            {
                icon: <SquareIcon fontSize="small" />,
                text: 'End level',
                onClick: () => onLibraryElementClick(ElementType.END_LEVEL),
            },
            {
                icon: <SquareIcon fontSize="small" />,
                text: 'Fat column',
                onClick: () => onLibraryElementClick(ElementType.FAT_COLUMN),
            },
        ];
    }, [onLibraryElementClick]);

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
        ];
    }, [onResetCamera, onToggleCollisionArea, onStartTestMode]);

    return (
        <AppBar className="level-builder__app-bar top-bar" position="static">
            <Toolbar className="top-bar__tool-bar">
                <Button size="small" startIcon={<KeyboardArrowLeftIcon />}>
                    Back
                </Button>
                <Divider orientation="vertical" flexItem />
                <DropDownMenu buttonText="Library" items={libraryItems} />
                <DropDownMenu buttonText="Actions" items={actionItems} />
            </Toolbar>
        </AppBar>
    );
};
