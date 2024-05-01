// vendors
import React, { useMemo, useRef } from 'react';
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
import { useDrag, useDrop } from 'react-dnd';
import { BounceIcon } from './icons/BounceIcon';
import { ColumnIcon } from './icons/ColumnIcon';
import { ArchIcon } from './icons/ArchIcon';
import type { Identifier, XYCoord } from 'dnd-core';

type Props = LevelElement & {
    index: number;
    isSelected: boolean;
    onClick: (index: number) => () => void;
    onDelete: (index: number) => (e: any) => void;
    onDuplicate: (index: number) => (e: any) => void;
    onLock: (index: number) => () => void;
    onChangeName: (index: number) => (e: any) => void;
    onMove: (dragIndex: number, hoverIndex: number) => void;
    isLocked?: boolean;
    disabled?: boolean;
    cantDelete?: boolean;
};

interface DragItem {
    index: number;
    id: string;
    type: string;
}

export const SceneItem: React.FC<Props> = React.memo(
    ({
        id,
        isSelected,
        isLocked,
        name,
        index,
        onClick,
        onLock,
        onDelete,
        onDuplicate,
        onChangeName,
        onMove,
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

        const ref = useRef<HTMLLIElement>(null);
        const [{ handlerId }, drop] = useDrop<
            DragItem,
            void,
            { handlerId: Identifier | null }
        >({
            accept: 'element',
            collect(monitor) {
                return {
                    handlerId: monitor.getHandlerId(),
                };
            },
            hover(item: DragItem, monitor) {
                if (!ref.current) {
                    return;
                }
                const dragIndex = item.index;
                const hoverIndex = index;

                // Don't replace items with themselves
                if (dragIndex === hoverIndex) {
                    return;
                }

                // Determine rectangle on screen
                const hoverBoundingRect = ref.current?.getBoundingClientRect();

                // Get vertical middle
                const hoverMiddleY =
                    (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

                // Determine mouse position
                const clientOffset = monitor.getClientOffset();

                // Get pixels to the top
                const hoverClientY =
                    (clientOffset as XYCoord).y - hoverBoundingRect.top;

                // Only perform the move when the mouse has crossed half of the items height
                // When dragging downwards, only move when the cursor is below 50%
                // When dragging upwards, only move when the cursor is above 50%

                // Dragging downwards
                if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                    return;
                }

                // Dragging upwards
                if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                    return;
                }

                // Time to actually perform the action
                onMove(dragIndex, hoverIndex);

                // Note: we're mutating the monitor item here!
                // Generally it's better to avoid mutations,
                // but it's good here for the sake of performance
                // to avoid expensive index searches.
                item.index = hoverIndex;
            },
        });

        const [{ isDragging }, drag] = useDrag({
            type: 'element',
            item: () => {
                return { id, index };
            },
            collect: (monitor: any) => ({
                isDragging: monitor.isDragging(),
            }),
        });

        const opacity = isDragging ? 0 : 1;
        drag(drop(ref));

        return (
            <ListItem
                ref={ref}
                style={{ opacity }}
                className="scene-content-panel__item"
                data-handler-id={handlerId}
            >
                <ListItemButton
                    disabled={disabled || isLocked}
                    selected={isSelected}
                    onClick={onClick(index)}
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
            </ListItem>
        );
    },
);
SceneItem.displayName = 'SceneItem';
