import React, { useCallback } from 'react';
import InputsManager from './Player/InputsManager';
import { ArrowLeft } from './icons/ArrowLeft';
import { ArrowUp } from './icons/ArrowUp';
import { ArrowRight } from './icons/ArrowRight';

interface Props {
    inputsManager: InputsManager;
}

export const MobileHUD: React.FC<Props> = ({ inputsManager }) => {
    const handleTouchStart = useCallback(
        (input: 'left' | 'right' | 'jump') => () => {
            inputsManager.inputsActive[input] = true;
        },
        [],
    );

    const handleTouchEnd = useCallback(
        (input: 'left' | 'right' | 'jump') => () => {
            inputsManager.inputsActive[input] = false;
        },
        [],
    );

    return (
        <div className="mobile-hud">
            <button
                onTouchStart={handleTouchStart('left')}
                onTouchEnd={handleTouchEnd('left')}
            >
                <ArrowLeft />
            </button>
            <button
                onTouchStart={handleTouchStart('jump')}
                onTouchEnd={handleTouchEnd('jump')}
            >
                <ArrowUp />
            </button>
            <button
                onTouchStart={handleTouchStart('right')}
                onTouchEnd={handleTouchEnd('right')}
            >
                <ArrowRight />
            </button>
        </div>
    );
};
