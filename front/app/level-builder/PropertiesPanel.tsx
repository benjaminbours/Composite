// vendors
import React from 'react';
import Paper from '@mui/material/Paper';
import { Vector3 } from 'three';
// project
import { LevelElement } from './types';
import { NumberInput, InputAdornment } from './NumericInput';

const propertyTextMap = {
    size: 'Size',
    position: 'Position',
    rotation: 'Rotation',
};

interface Props {
    element: LevelElement;
    onUpdateProperty: (key: string, value: Vector3) => void;
}

export const PropertiesPanel: React.FC<Props> = ({
    element,
    onUpdateProperty,
}) => {
    return (
        <Paper className="panel properties-panel">
            <h3>{`${element.name} - Properties`}</h3>
            {Object.entries(element.properties).map(([key, value]) => {
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
                    <div key={key} className="property">
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
                                        <InputAdornment>z</InputAdornment>
                                    }
                                    onChange={onChange('z') as any}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </Paper>
    );
};
