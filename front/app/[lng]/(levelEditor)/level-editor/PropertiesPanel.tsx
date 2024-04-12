// vendors
import React from 'react';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
// our libs
import {
    ElementType,
    LevelElement,
    WallDoorProperties,
} from '@benjaminbours/composite-core';
// project
import { MUISwitch } from './CustomSwitch';
import classNames from 'classnames';
import { Vec3Row } from './Vec3Row';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const propertyTextMap = {
    id: 'ID',
    door_id: 'Door id',
    size: 'Size',
    position: 'Position',
    doorPosition: 'Door position',
    rotation: 'Rotation',
    side: 'Side',
    interactive: 'Interactive',
    transform: 'Transform',
};

interface Props {
    state: LevelElement[];
    element: LevelElement;
    onUpdateProperty: (key: string, value: any) => void;
    disabled?: boolean;
}

export const PropertiesPanel: React.FC<Props> = ({
    state,
    element,
    onUpdateProperty,
    disabled,
}) => {
    return (
        <Paper className="panel properties-panel">
            <h3>{`${element.name} - Properties`}</h3>
            <ul>
                {Object.entries(element.properties).map(([key, value]) => {
                    const cssClass = classNames({
                        property: true,
                        [key]: true,
                    });
                    if (key === 'door_id') {
                        const doors = state
                            .filter((el) => el.type === ElementType.WALL_DOOR)
                            .map((el) => {
                                const properties =
                                    el.properties as WallDoorProperties;
                                return (
                                    <MenuItem
                                        key={properties.id}
                                        value={properties.id}
                                    >
                                        {`Door id ${properties.id}`}
                                    </MenuItem>
                                );
                            });
                        const hasDoorInTheScene = doors.length > 0;
                        doors.unshift(
                            <MenuItem
                                key="no_door_selected"
                                value="no_door_selected"
                            >
                                No door selected
                            </MenuItem>,
                        );
                        return (
                            <li key={key} className={cssClass}>
                                <label style={{ display: 'block' }}>
                                    {(propertyTextMap as any)[key]}
                                </label>
                                {hasDoorInTheScene ? (
                                    <Select
                                        disabled={disabled}
                                        value={
                                            value !== undefined
                                                ? value
                                                : 'no_door_selected'
                                        }
                                        label="Door id"
                                        onChange={(event: any) => {
                                            onUpdateProperty(
                                                key,
                                                event.target.value,
                                            );
                                        }}
                                    >
                                        {doors}
                                    </Select>
                                ) : (
                                    <p>No door in the scene</p>
                                )}
                            </li>
                        );
                    }

                    if (key === 'id') {
                        return (
                            <li key={key} className={cssClass}>
                                <label>
                                    {`${element.type} ${
                                        (propertyTextMap as any)[key]
                                    }`}
                                    : {value}
                                </label>
                            </li>
                        );
                    }

                    if (key === 'side') {
                        return (
                            <li key={key} className={cssClass}>
                                <label>{(propertyTextMap as any)[key]}</label>
                                <div className="properties-panel__inputs-container">
                                    <MUISwitch
                                        checked={value}
                                        disabled={disabled}
                                        onChange={(event: any) => {
                                            event.currentTarget.blur();
                                            onUpdateProperty(
                                                key,
                                                event.currentTarget.checked,
                                            );
                                        }}
                                    />
                                </div>
                            </li>
                        );
                    }

                    if (key === 'interactive') {
                        return (
                            <li key={key} className={cssClass}>
                                <label>{(propertyTextMap as any)[key]}</label>
                                <div className="properties-panel__inputs-container">
                                    <Switch
                                        disabled={disabled}
                                        checked={value}
                                        onChange={(event: any) => {
                                            event.currentTarget.blur();
                                            onUpdateProperty(
                                                key,
                                                event.currentTarget.checked,
                                            );
                                        }}
                                    />
                                </div>
                            </li>
                        );
                    }

                    if (key === 'size' || key === 'doorPosition') {
                        const onChange =
                            (field: 'x' | 'y' | 'z') =>
                            (_event: any, fieldValue: number) => {
                                if (fieldValue === undefined) {
                                    return;
                                }
                                const nextValue = value.clone();
                                nextValue[field] = fieldValue;
                                onUpdateProperty(key, nextValue);
                            };
                        return (
                            <li key={key} className={cssClass}>
                                <Accordion elevation={10}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1-content"
                                        id="panel1-header"
                                    >
                                        {(propertyTextMap as any)[key]}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Vec3Row
                                            step={0.1}
                                            minX={1}
                                            minY={1}
                                            minZ={1}
                                            disabled={disabled}
                                            onChange={onChange}
                                            value={value}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            </li>
                        );
                    }

                    if (key === 'transform') {
                        type TransformationKeys = 'position' | 'rotation';
                        const transformations = ['position', 'rotation'];
                        const onChange =
                            (transform: TransformationKeys) =>
                            (field: 'x' | 'y' | 'z') =>
                            (_event: any, fieldValue: number) => {
                                if (fieldValue === undefined) {
                                    return;
                                }
                                const nextValue = {
                                    position: value.position.clone(),
                                    rotation: value.rotation.clone(),
                                };
                                nextValue[transform][field] = fieldValue;
                                onUpdateProperty(key, nextValue);
                            };
                        return (
                            <li key={key} className={cssClass}>
                                <Accordion elevation={10}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1-content"
                                        id="panel1-header"
                                    >
                                        {(propertyTextMap as any)[key]}
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <ul>
                                            {transformations.map(
                                                (transformationKey) => {
                                                    const step =
                                                        transformationKey ===
                                                        'rotation'
                                                            ? 10
                                                            : 0.1;
                                                    return (
                                                        <li
                                                            key={
                                                                transformationKey
                                                            }
                                                            className={cssClass}
                                                        >
                                                            <label>
                                                                {
                                                                    (
                                                                        propertyTextMap as any
                                                                    )[
                                                                        transformationKey
                                                                    ]
                                                                }
                                                            </label>
                                                            <Vec3Row
                                                                step={step}
                                                                disabled={
                                                                    disabled
                                                                }
                                                                onChange={onChange(
                                                                    transformationKey as TransformationKeys,
                                                                )}
                                                                value={
                                                                    value[
                                                                        transformationKey
                                                                    ] as any
                                                                }
                                                                withZ
                                                                isBounceRotation={
                                                                    transformationKey ===
                                                                        'rotation' &&
                                                                    element.type ===
                                                                        ElementType.BOUNCE
                                                                }
                                                            />
                                                        </li>
                                                    );
                                                },
                                            )}
                                        </ul>
                                    </AccordionDetails>
                                </Accordion>
                            </li>
                        );
                    }

                    return null;
                })}
            </ul>
        </Paper>
    );
};
