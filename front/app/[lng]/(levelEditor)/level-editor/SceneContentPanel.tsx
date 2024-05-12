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
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// our libs
import { ElementType, LevelElement } from '@benjaminbours/composite-core';
// project
import { SceneItem } from './SceneItem';
import { DropDownMenu } from './DropDownMenu';
import { BounceIcon } from './icons/BounceIcon';
import { ColumnIcon } from './icons/ColumnIcon';
import { ArchIcon } from './icons/ArchIcon';
import IconButton from '@mui/material/IconButton';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

interface Props {
    elements: LevelElement[];
    currentEditingIndex: number | undefined;
    onElementClick: (index: number) => () => void;
    onElementDelete: (index: number) => (e: any) => void;
    onElementDuplicate: (index: number) => (e: any) => void;
    onElementLock: (index: number) => () => void;
    onChangeName: (index: number) => (e: any) => void;
    onAddElement: (type: ElementType) => void;
    onElementMove: (dragIndex: number, hoverIndex: number) => void;
    onRedo: () => void;
    onUndo: () => void;
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
        onElementMove,
        onRedo,
        onUndo,
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
                        <div className="scene-content-panel__content-header">
                            <DropDownMenu
                                className="scene-content-panel__add-button"
                                buttonText="Add"
                                items={libraryItems}
                                icon={<AddIcon />}
                                disabled={disabled}
                            />
                            <IconButton
                                size="small"
                                title="Undo"
                                onClick={onUndo}
                                disabled={disabled}
                            >
                                <UndoIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                title="Redo"
                                onClick={onRedo}
                                disabled={disabled}
                            >
                                <RedoIcon />
                            </IconButton>
                        </div>
                        <DndProvider backend={HTML5Backend}>
                            <List>
                                {elements.map((element, index) => (
                                    <SceneItem
                                        key={element.id}
                                        {...element}
                                        index={index}
                                        isSelected={
                                            index === currentEditingIndex
                                        }
                                        onDelete={onElementDelete}
                                        onDuplicate={onElementDuplicate}
                                        onChangeName={onChangeName}
                                        onClick={onElementClick}
                                        onLock={onElementLock}
                                        onMove={onElementMove}
                                        disabled={disabled}
                                        cantDelete={
                                            element.type ===
                                            ElementType.END_LEVEL
                                        }
                                    />
                                ))}
                            </List>
                        </DndProvider>
                    </div>
                </AccordionDetails>
            </Accordion>
        );
    },
);
SceneContentPanel.displayName = 'SceneContentPanel';
