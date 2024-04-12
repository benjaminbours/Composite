import React from 'react';
import { InputAdornment, NumberInput } from './NumericInput';
import { Vector3 } from 'three';

interface Props {
    step: number;
    disabled?: boolean;
    minX?: number;
    minY?: number;
    minZ?: number;
    onChange: (
        key: 'x' | 'y' | 'z',
    ) => (_event: any, fieldValue: number) => void;
    value: Vector3;
    withZ?: boolean;
    isBounceRotation?: boolean;
}

export const Vec3Row: React.FC<Props> = ({
    step,
    disabled,
    minX,
    minY,
    minZ,
    onChange,
    value,
    withZ,
    isBounceRotation,
}) => {
    return (
        <div className="properties-panel__inputs-container">
            {!isBounceRotation && (
                <NumberInput
                    disabled={disabled}
                    step={step}
                    min={minX}
                    value={value.x}
                    startAdornment={<InputAdornment>X</InputAdornment>}
                    onChange={onChange('x') as any}
                />
            )}
            <NumberInput
                disabled={disabled}
                step={step}
                min={minY}
                value={value.y}
                startAdornment={<InputAdornment>Y</InputAdornment>}
                onChange={onChange('y') as any}
            />
            {withZ && !isBounceRotation && (
                <NumberInput
                    disabled={disabled}
                    step={step}
                    min={minZ}
                    value={value.z}
                    startAdornment={<InputAdornment>Z</InputAdornment>}
                    onChange={onChange('z') as any}
                />
            )}
        </div>
    );
};
