// vendors
import React, { useMemo } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import SquareIcon from '@mui/icons-material/Square';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { ElementType, LevelElement } from '@benjaminbours/composite-core';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { BounceIcon } from './icons/BounceIcon';
import { ColumnIcon } from './icons/ColumnIcon';
import { ArchIcon } from './icons/ArchIcon';

type Props = LevelElement & {
    index: number;
    isSelected: boolean;
    onClick: (index: number) => () => void;
    onDelete: (index: number) => () => void;
    onDuplicate: (index: number) => () => void;
    onLock: (index: number) => () => void;
    onChangeName: (index: number) => (e: any) => void;
    isLocked?: boolean;
    disabled?: boolean;
    cantDelete?: boolean;
};

export const SceneItem: React.FC<Props> = React.memo(
    ({
        isSelected,
        isLocked,
        name,
        index,
        onClick,
        onLock,
        onDelete,
        onDuplicate,
        onChangeName,
        disabled,
        cantDelete,
        type,
    }) => {
        const icon = useMemo(() => {
            switch (type) {
                case ElementType.END_LEVEL:
                    return (
                        <SportsScoreIcon className="scene-content-panel__item-icon" />
                    );
                case ElementType.WALL_DOOR:
                    return (
                        <DoorSlidingIcon className="scene-content-panel__item-icon" />
                    );
                case ElementType.DOOR_OPENER:
                    return (
                        <ToggleOnIcon className="scene-content-panel__item-icon" />
                    );
                case ElementType.ARCH:
                    return (
                        <ArchIcon className="scene-content-panel__bounce-icon" />
                    );
                case ElementType.BOUNCE:
                    return (
                        <BounceIcon className="scene-content-panel__bounce-icon" />
                    );
                case ElementType.FAT_COLUMN:
                    return (
                        <ColumnIcon className="scene-content-panel__bounce-icon" />
                    );
                default:
                    return (
                        <SquareIcon className="scene-content-panel__item-icon" />
                    );
            }
        }, [type]);
        return (
            <ListItem className="scene-content-panel__item">
                <ListItemButton
                    disabled={disabled || isLocked}
                    selected={isSelected}
                    onClick={onClick(index)}
                    className="scene-content-panel__item-button"
                >
                    {icon}
                    <TextField
                        variant="standard"
                        value={name}
                        disabled={disabled || isLocked}
                        onChange={(e) => {
                            onChangeName(index)(e);
                        }}
                    />
                </ListItemButton>
                <IconButton
                    size="small"
                    title={isLocked ? 'Unlock element' : 'Lock element'}
                    onClick={onLock(index)}
                    disabled={disabled}
                    className="scene-content-panel__item-action"
                >
                    {isLocked ? <LockIcon /> : <LockOpenIcon />}
                </IconButton>
                <IconButton
                    size="small"
                    title="Duplicate element"
                    onClick={onDuplicate(index)}
                    disabled={disabled || cantDelete || isLocked}
                    className="scene-content-panel__item-action"
                >
                    <ContentCopyIcon />
                </IconButton>
                <IconButton
                    size="small"
                    title="Delete element"
                    onClick={onDelete(index)}
                    disabled={disabled || cantDelete || isLocked}
                    className="scene-content-panel__item-action"
                >
                    <DeleteIcon />
                </IconButton>
            </ListItem>
        );
    },
);
SceneItem.displayName = 'SceneItem';
