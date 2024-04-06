// vendors
import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import TextField from '@mui/material/TextField';
import SquareIcon from '@mui/icons-material/Square';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { LevelElement } from '@benjaminbours/composite-core';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

type Props = LevelElement & {
    index: number;
    isSelected: boolean;
    onClick: (index: number) => () => void;
    onDelete: (index: number) => () => void;
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
        onChangeName,
        disabled,
        cantDelete,
    }) => {
        return (
            <ListItem className="scene-content-panel__item">
                <ListItemButton
                    disabled={disabled || isLocked}
                    selected={isSelected}
                    onClick={onClick(index)}
                    className="scene-content-panel__item-button"
                >
                    <SquareIcon className="scene-content-panel__item-icon" />
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
