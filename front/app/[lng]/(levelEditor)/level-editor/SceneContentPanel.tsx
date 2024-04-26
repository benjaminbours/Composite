// vendors
import React, { useMemo } from 'react';
import List from '@mui/material/List';
import SquareIcon from '@mui/icons-material/Square';
import AddIcon from '@mui/icons-material/Add';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
// our libs
import { ElementType, LevelElement } from '@benjaminbours/composite-core';
// project
import { SceneItem } from './SceneItem';
import { DropDownMenu } from './DropDownMenu';
import { BounceIcon } from './icons/BounceIcon';
import { ColumnIcon } from './icons/ColumnIcon';
import { ArchIcon } from './icons/ArchIcon';

interface Props {
    elements: LevelElement[];
    currentEditingIndex: number | undefined;
    onElementClick: (index: number) => () => void;
    onElementDelete: (index: number) => () => void;
    onElementDuplicate: (index: number) => () => void;
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
        onElementDuplicate,
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
                    icon: <DoorSlidingIcon fontSize="small" />,
                    text: 'Door',
                    onClick: () => onAddElement(ElementType.WALL_DOOR),
                },
                {
                    icon: <ToggleOnIcon fontSize="small" />,
                    text: 'Door opener',
                    onClick: () => onAddElement(ElementType.DOOR_OPENER),
                },
                {
                    icon: <ArchIcon className="bounce-icon-add-menu" />,
                    text: 'Arch',
                    onClick: () => onAddElement(ElementType.ARCH),
                },
                {
                    icon: <BounceIcon className="bounce-icon-add-menu" />,
                    text: 'Bounce',
                    onClick: () => onAddElement(ElementType.BOUNCE),
                },
                {
                    icon: <ColumnIcon className="bounce-icon-add-menu" />,
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
                            className="scene-content-panel__add-button"
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
                                    onDuplicate={onElementDuplicate}
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
