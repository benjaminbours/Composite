// vendors
import React from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
// project
import { LevelElement } from './types';
import { Divider } from '@mui/material';
import { SceneItem } from './SceneItem';

interface Props {
    elements: LevelElement[];
    currentEditingIndex: number | undefined;
    onElementClick: (index: number) => () => void;
    onElementDelete: (index: number) => () => void;
    onChangeName: (index: number) => (e: any) => void;
}

export const SceneContentPanel: React.FC<Props> = React.memo(
    ({
        elements,
        currentEditingIndex,
        onElementClick,
        onChangeName,
        onElementDelete,
    }) => {
        return (
            <Paper className="panel scene-content-panel">
                <h3>Scene</h3>
                <Divider className="scene-content-panel__divider" />
                <List>
                    {elements.map((element, index) => (
                        <SceneItem
                            key={index}
                            {...element}
                            index={index}
                            isSelected={index === currentEditingIndex}
                            onDelete={onElementDelete}
                            onChangeName={onChangeName}
                            onClick={onElementClick}
                        />
                    ))}
                </List>
            </Paper>
        );
    },
);
SceneContentPanel.displayName = 'SceneContentPanel';
