// vendors
import React, { useMemo } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import SquareIcon from '@mui/icons-material/Square';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import CameraIcon from '@mui/icons-material/Camera';
import { ElementLibraryItem, ElementType } from './types';
import { Divider } from '@mui/material';

interface Props {
    onLibraryElementClick: (type: ElementType) => void;
    onResetCamera: () => void;
}

export const TopBar: React.FC<Props> = ({
    onLibraryElementClick,
    onResetCamera,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const elementsLibrary: ElementLibraryItem[] = useMemo(() => {
        return [
            {
                type: ElementType.WALL,
                img: '/images/elements/wall.png',
                name: 'Wall',
            },
            {
                type: ElementType.WALL_DOOR,
                img: '/images/elements/wall_door.png',
                name: 'Door',
            },
            {
                type: ElementType.DOOR_OPENER,
                img: '/images/elements/wall_door.png',
                name: 'Door opener',
            },
            {
                type: ElementType.ARCH,
                img: '/images/elements/arch.png',
                name: 'Arch',
            },
            {
                type: ElementType.BOUNCE,
                img: '/images/elements/bounce.png',
                name: 'Bounce',
            },
            {
                type: ElementType.END_LEVEL,
                img: '/images/elements/end_level.png',
                name: 'End level',
            },
            {
                type: ElementType.FAT_COLUMN,
                img: '/images/elements/fat_column.png',
                name: 'Fat column',
            },
        ];
    }, []);

    return (
        <AppBar className="level-builder__app-bar top-bar" position="static">
            <Toolbar className="top-bar__tool-bar">
                <Button size="small" startIcon={<KeyboardArrowLeftIcon />}>
                    Back
                </Button>
                <Divider orientation="vertical" flexItem />
                <Button
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    variant="outlined"
                    endIcon={<KeyboardArrowDownIcon />}
                    size="small"
                >
                    Library
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {elementsLibrary.map(({ img, type, name }) => (
                        <MenuItem
                            key={type}
                            onClick={() => {
                                handleClose();
                                onLibraryElementClick(type);
                            }}
                        >
                            <ListItemIcon>
                                <SquareIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>{name}</ListItemText>
                            {/* <Typography variant="body2" color="text.secondary">
                            ⌘X
                        </Typography> */}
                        </MenuItem>
                    ))}
                </Menu>
                <Button
                    id="camera-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={onResetCamera}
                    variant="outlined"
                    endIcon={<CameraIcon />}
                    size="small"
                >
                    Reset camera
                </Button>
            </Toolbar>
        </AppBar>
    );
};
