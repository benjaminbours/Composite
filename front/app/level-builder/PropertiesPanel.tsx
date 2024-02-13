// vendors
import React from 'react';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
// project
import { ElementType, LevelElement, WallDoorProperties } from './types';
import { NumberInput, InputAdornment } from './NumericInput';
import { MUISwitch } from './CustomSwitch';

const propertyTextMap = {
    id: 'ID',
    door_id: 'Door id',
    size: 'Size',
    position: 'Position',
    doorPosition: 'Door position',
    rotation: 'Rotation',
    side: 'Side',
    interactive: 'Interactive',
};

interface Props {
    state: LevelElement[];
    element: LevelElement;
    onUpdateProperty: (key: string, value: any) => void;
}

export const PropertiesPanel: React.FC<Props> = ({
    state,
    element,
    onUpdateProperty,
}) => {
    return (
        <Paper className="panel properties-panel">
            <h3>{`${element.name} - Properties`}</h3>
            <ul>
                {Object.entries(element.properties).map(([key, value]) => {
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
                        return (
                            <li key={key} className="property">
                                <label style={{ display: 'block' }}>
                                    {(propertyTextMap as any)[key]}
                                </label>
                                {doors.length > 0 ? (
                                    <Select
                                        value={value}
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
                            <li key={key} className="property">
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
                            <li key={key} className="property">
                                <label>{(propertyTextMap as any)[key]}</label>
                                <div className="properties-panel__inputs-container">
                                    <MUISwitch
                                        checked={value}
                                        onChange={(event: any) => {
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
                            <li key={key} className="property">
                                <label>{(propertyTextMap as any)[key]}</label>
                                <div className="properties-panel__inputs-container">
                                    <Switch
                                        checked={value}
                                        onChange={(event: any) => {
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
                    const step = key === 'rotation' ? 10 : 0.1;
                    return (
                        <li key={key} className="property">
                            <label>{(propertyTextMap as any)[key]}</label>
                            <div className="properties-panel__inputs-container">
                                <NumberInput
                                    step={step}
                                    min={key === 'size' ? 1 : undefined}
                                    value={value.x}
                                    startAdornment={
                                        <InputAdornment>X</InputAdornment>
                                    }
                                    onChange={onChange('x') as any}
                                />
                                <NumberInput
                                    step={step}
                                    min={key === 'size' ? 1 : undefined}
                                    value={value.y}
                                    startAdornment={
                                        <InputAdornment>Y</InputAdornment>
                                    }
                                    onChange={onChange('y') as any}
                                />
                                {key !== 'size' && (
                                    <NumberInput
                                        step={step}
                                        value={value.z}
                                        startAdornment={
                                            <InputAdornment>Z</InputAdornment>
                                        }
                                        onChange={onChange('z') as any}
                                    />
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Paper>
    );
};
