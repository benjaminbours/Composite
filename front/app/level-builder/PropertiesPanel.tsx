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
                // const isVector3 = value.z !== undefined;
                return (
                    <div key={key} className="property">
                        <label>{(propertyTextMap as any)[key]}</label>
                        <div className="properties-panel__inputs-container">
                            <NumberInput
                                value={value.x}
                                startAdornment={
                                    <InputAdornment>X</InputAdornment>
                                }
                                onChange={(_event, fieldValue) => {
                                    if (!fieldValue) {
                                        return;
                                    }
                                    const nextValue = value.clone();
                                    nextValue.x = fieldValue;
                                    onUpdateProperty(key, nextValue);
                                }}
                            />
                            <NumberInput
                                value={value.y}
                                startAdornment={
                                    <InputAdornment>Y</InputAdornment>
                                }
                            />
                        </div>
                    </div>
                );
            })}
        </Paper>
    );
};
