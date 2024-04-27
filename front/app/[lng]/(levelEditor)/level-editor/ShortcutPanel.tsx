// vendors
import React, { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DeleteIcon from '@mui/icons-material/Delete';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
// project
import { Divider } from '@mui/material';

interface Props {
    // TODO: Generate this list based on a config with all the shortcuts registered
}

export const ShortcutPanel: React.FC<Props> = React.memo(() => {
    // TODO: Adapt text depending of detected OS
    const shortcuts = useMemo(
        () => [
            {
                shortcut: 'Ctrl + Z',
                text: 'Undo',
                icon: <UndoIcon />,
            },
            {
                shortcut: 'Ctrl + Shift + Z',
                text: 'Redo',
                icon: <RedoIcon />,
            },
            {
                shortcut: 'R',
                text: 'Rotate element',
                icon: <Rotate90DegreesCwIcon />,
            },
            {
                shortcut: 'T',
                text: 'Translate element',
                icon: <ControlCameraIcon />,
            },
            {
                shortcut: 'Delete',
                text: 'Delete element',
                icon: <DeleteIcon />,
            },
            {
                shortcut: 'Backspace',
                text: 'Reset player position',
                icon: <RestartAltIcon />,
            },
        ],
        [],
    );

    return (
        <Paper className="panel shortcut-panel">
            <h3>Shortcuts</h3>
            <Divider />
            <List>
                {shortcuts.map((item, index) => (
                    <ListItem key={index} className="shortcut-panel__item">
                        {item.icon}
                        <span className="shortcut-panel__item-action-text">
                            {item.text}
                        </span>
                        <span className="shortcut-panel__item-shortcut-text">
                            {item.shortcut}
                        </span>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
});
ShortcutPanel.displayName = 'ShortcutPanel';
