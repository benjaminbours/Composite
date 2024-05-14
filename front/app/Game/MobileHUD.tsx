import React, { useCallback, useEffect } from 'react';
import InputsManager from './Player/InputsManager';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import IconButton from '@mui/material/IconButton';

interface Props {
    inputsManager: InputsManager;
    isMobileInteractButtonAdded: boolean;
}

export const MobileHUD: React.FC<Props> = ({
    inputsManager,
    isMobileInteractButtonAdded,
}) => {
    const handleTouchStart = useCallback(
        (input: 'left' | 'right' | 'jump' | 'interact') => () => {
            inputsManager.inputsActive[input] = true;
        },
        [],
    );

    const handleTouchEnd = useCallback(
        (input: 'left' | 'right' | 'jump' | 'interact') => () => {
            inputsManager.inputsActive[input] = false;
        },
        [],
    );

    useEffect(() => {
        const onTouchStart = (e: any) => {
            // is not near edge of view, exit
            if (e.pageX > 10 && e.pageX < window.innerWidth - 10) {
                return;
            }
            // prevent swipe to navigate gesture
            e.preventDefault();
        };

        document.addEventListener('touchstart', onTouchStart);
        return () => {
            document.removeEventListener('touchstart', onTouchStart);
        };
    }, []);

    return (
        <div className="mobile-hud">
            {isMobileInteractButtonAdded && (
                <IconButton
                    className="mobile-hud__button mobile-hud__interact"
                    onTouchStart={handleTouchStart('interact')}
                    onTouchEnd={handleTouchEnd('interact')}
                >
                    Interact
                </IconButton>
            )}
            <IconButton
                className="mobile-hud__button mobile-hud__arrow-left"
                onTouchStart={handleTouchStart('left')}
                onTouchEnd={handleTouchEnd('left')}
            >
                <ArrowForwardIosIcon />
            </IconButton>
            <IconButton
                className="mobile-hud__button mobile-hud__jump"
                onTouchStart={handleTouchStart('jump')}
                onTouchEnd={handleTouchEnd('jump')}
            >
                <SpaceBarIcon />
            </IconButton>
            <IconButton
                className="mobile-hud__button mobile-hud__arrow-right"
                onTouchStart={handleTouchStart('right')}
                onTouchEnd={handleTouchEnd('right')}
            >
                <ArrowForwardIosIcon />
            </IconButton>
        </div>
    );
};
