// vendors
import React, { useMemo } from 'react';
import List from '@mui/material/List';
import SquareIcon from '@mui/icons-material/Square';
import AddIcon from '@mui/icons-material/Add';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// our libs
import { ElementType, LevelElement } from '@benjaminbours/composite-core';
// project
import { SceneItem } from './SceneItem';
import { DropDownMenu } from './DropDownMenu';

interface Props {
    elements: LevelElement[];
    currentEditingIndex: number | undefined;
    onElementClick: (index: number) => () => void;
    onElementDelete: (index: number) => () => void;
    onElementLock: (index: number) => () => void;
    onChangeName: (index: number) => (e: any) => void;
    onAddElement: (type: ElementType) => void;
    disabled?: boolean;
}

export const SceneContentPanel: React.FC<Props> = React.memo(
    ({
        elements,
        currentEditingIndex,
        onElementClick,
        onElementLock,
        onChangeName,
        onElementDelete,
        onAddElement,
        disabled,
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
                // {
                //     icon: <SquareIcon fontSize="small" />,
                //     text: 'End level',
                //     onClick: () => onAddElement(ElementType.END_LEVEL),
                // },
                {
                    icon: <SquareIcon fontSize="small" />,
                    text: 'Fat column',
                    onClick: () => onAddElement(ElementType.FAT_COLUMN),
                },
            ];
        }, [onAddElement]);
        return (
            <Accordion
                defaultExpanded
                elevation={1}
                className="panel scene-content-panel level-editor__accordion"
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <h3>Scene</h3>
                </AccordionSummary>
                <AccordionDetails>
                    <div className="scene-content-panel__content">
                        <DropDownMenu
                            buttonText="Add"
                            items={libraryItems}
                            icon={<AddIcon />}
                            disabled={disabled}
                        />
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
                                    onLock={onElementLock}
                                    disabled={disabled}
                                    cantDelete={
                                        element.type === ElementType.END_LEVEL
                                    }
                                />
                            ))}
                        </List>
                    </div>
                </AccordionDetails>
            </Accordion>
        );
    },
);
SceneContentPanel.displayName = 'SceneContentPanel';
