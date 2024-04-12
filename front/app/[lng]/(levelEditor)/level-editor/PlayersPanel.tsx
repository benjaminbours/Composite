// vendors
import React, { useCallback } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Vec3Row } from './Vec3Row';
import { Vector3 } from 'three';

interface Props {
    lightStartPosition: Vector3;
    shadowStartPosition: Vector3;
    onUpdatePlayerStartPosition: (
        side: 'light' | 'shadow',
        value: Vector3,
    ) => void;
}

export const PlayersPanel: React.FC<Props> = ({
    lightStartPosition,
    shadowStartPosition,
    onUpdatePlayerStartPosition,
}) => {
    const onChange = useCallback(
        (side: 'light' | 'shadow') =>
            (field: 'x' | 'y' | 'z') =>
            (_event: any, fieldValue: number) => {
                if (fieldValue === undefined) {
                    return;
                }
                let value =
                    side === 'light' ? lightStartPosition : shadowStartPosition;
                const nextValue = value.clone();
                nextValue[field] = fieldValue;
                onUpdatePlayerStartPosition(side, nextValue);
            },
        [lightStartPosition, shadowStartPosition, onUpdatePlayerStartPosition],
    );
    return (
        <Accordion
            elevation={1}
            className="panel scene-content-panel level-editor__accordion"
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h3>Players start</h3>
            </AccordionSummary>
            <AccordionDetails>
                <label htmlFor="">Light</label>
                <Vec3Row
                    step={0.1}
                    minY={0}
                    onChange={onChange('light')}
                    value={lightStartPosition}
                />
                <label htmlFor="">Shadow</label>
                <Vec3Row
                    step={0.1}
                    minY={0}
                    onChange={onChange('shadow')}
                    value={shadowStartPosition}
                />
            </AccordionDetails>
        </Accordion>
    );
};
