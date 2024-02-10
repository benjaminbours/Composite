// vendors
import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import TextField from '@mui/material/TextField';
import SquareIcon from '@mui/icons-material/Square';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { LevelElement } from './types';

type Props = LevelElement & {
    index: number;
    isSelected: boolean;
    onClick: (index: number) => () => void;
    onDelete: (index: number) => () => void;
    onChangeName: (index: number) => (e: any) => void;
};

export const SceneItem: React.FC<Props> = React.memo(
    ({ isSelected, name, index, onClick, onDelete, onChangeName }) => {
        return (
            <ListItem
                className="scene-content-panel__item"
                secondaryAction={
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={onDelete(index)}
                    >
                        <DeleteIcon />
                    </IconButton>
                }
            >
                <ListItemButton selected={isSelected} onClick={onClick(index)}>
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
