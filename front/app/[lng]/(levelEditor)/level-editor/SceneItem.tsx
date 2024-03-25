// vendors
import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import TextField from '@mui/material/TextField';
import SquareIcon from '@mui/icons-material/Square';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { LevelElement } from '@benjaminbours/composite-core';

type Props = LevelElement & {
    index: number;
    isSelected: boolean;
    onClick: (index: number) => () => void;
    onDelete: (index: number) => () => void;
    onChangeName: (index: number) => (e: any) => void;
    disabled?: boolean;
    cantDelete?: boolean;
};

export const SceneItem: React.FC<Props> = React.memo(
    ({
        isSelected,
        name,
        index,
        onClick,
        onDelete,
        onChangeName,
        disabled,
        cantDelete,
    }) => {
        return (
            <ListItem
                className="scene-content-panel__item"
                secondaryAction={
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={onDelete(index)}
                        disabled={disabled || cantDelete}
                    >
                        <DeleteIcon />
                    </IconButton>
                }
            >
                <ListItemButton
                    disabled={disabled}
                    selected={isSelected}
                    onClick={onClick(index)}
                >
                    <ListItemIcon>
                        <SquareIcon />
                    </ListItemIcon>
                    <TextField
                        variant="standard"
                        value={name}
                        onChange={(e) => {
                            onChangeName(index)(e);
                        }}
                    />
                </ListItemButton>
            </ListItem>
        );
    },
);
SceneItem.displayName = 'SceneItem';
