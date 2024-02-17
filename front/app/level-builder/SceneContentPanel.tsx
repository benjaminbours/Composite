// vendors
import React, { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import SquareIcon from '@mui/icons-material/Square';
import AddIcon from '@mui/icons-material/Add';
// project
import { ElementType, LevelElement } from './types';
import { Divider } from '@mui/material';
import { SceneItem } from './SceneItem';
import { DropDownMenu } from './DropDownMenu';

interface Props {
    elements: LevelElement[];
    currentEditingIndex: number | undefined;
    onElementClick: (index: number) => () => void;
    onElementDelete: (index: number) => () => void;
    onChangeName: (index: number) => (e: any) => void;
    onAddElement: (type: ElementType) => void;
}

export const SceneContentPanel: React.FC<Props> = React.memo(
    ({
        elements,
        currentEditingIndex,
        onElementClick,
        onChangeName,
        onElementDelete,
        onAddElement,
    }) => {
        const libraryItems = useMemo(() => {
            return [
                {
                    icon: <SquareIcon fontSize="small" />,
                    text: 'Wall',
                    onClick: () => onAddElement(ElementType.WALL),
                },
                {
                    icon: <SquareIcon fontSize="small" />,
                    text: 'Door',
                    onClick: () => onAddElement(ElementType.WALL_DOOR),
                },
                {
                    icon: <SquareIcon fontSize="small" />,
                    text: 'Door opener',
                    onClick: () => onAddElement(ElementType.DOOR_OPENER),
                },
                {
                    icon: <SquareIcon fontSize="small" />,
                    text: 'Arch',
                    onClick: () => onAddElement(ElementType.ARCH),
                },
                {
                    icon: <SquareIcon fontSize="small" />,
                    text: 'Bounce',
                    onClick: () => onAddElement(ElementType.BOUNCE),
                },
                {
                    icon: <SquareIcon fontSize="small" />,
                    text: 'End level',
                    onClick: () => onAddElement(ElementType.END_LEVEL),
                },
                {
                    icon: <SquareIcon fontSize="small" />,
                    text: 'Fat column',
                    onClick: () => onAddElement(ElementType.FAT_COLUMN),
                },
            ];
        }, [onAddElement]);
        return (
            <Paper className="panel scene-content-panel">
                <div className="scene-content-panel__header">
                    <h3>Scene</h3>
                    <DropDownMenu
                        buttonText="Add"
                        items={libraryItems}
                        icon={<AddIcon />}
                    />
                </div>
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
