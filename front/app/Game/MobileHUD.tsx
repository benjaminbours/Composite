import React, { useCallback, useEffect } from 'react';
import InputsManager from './Player/InputsManager';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import IconButton from '@mui/material/IconButton';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import App from './App';
import { wrapperBlurEvent } from '../[lng]/(levelEditor)/level-editor/utils';
import Paper from '@mui/material/Paper';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Props {
    appRef: React.MutableRefObject<App | undefined>;
    inputsManager: InputsManager;
    isMobileInteractButtonAdded: boolean;
    withSwitchPlayer: boolean;
    onExitGame?: () => void;
}

export const MobileHUD: React.FC<Props> = ({
    appRef,
    inputsManager,
    isMobileInteractButtonAdded,
    withSwitchPlayer,
    onExitGame,
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

    const handleClickSwitchPlayer = useCallback(() => {
        if (!appRef.current) {
            return;
        }
        appRef.current.switchPlayer();
    }, [appRef]);

    const handleClickResetPosition = useCallback(() => {
        if (!appRef.current) {
            return;
        }
        appRef.current.resetSinglePlayerPosition();
    }, [appRef]);

    useEffect(() => {
        const onTouch = (e: any) => {
            // is not near edge of view, exit
            if (
                e.touches[0].clientX > 10 &&
                e.touches[0].clientX < window.innerWidth - 10
            ) {
                return;
            }
            // prevent swipe to navigate gesture
            e.preventDefault();
        };

        document.addEventListener('touchstart', onTouch, {
            passive: false,
        });
        document.addEventListener('touchmove', onTouch, {
            passive: false,
        });
        return () => {
            document.removeEventListener('touchstart', onTouch);
            document.removeEventListener('touchmove', onTouch);
        };
    }, []);

    return (
        <div className="mobile-hud">
            <Paper className="mobile-hud__run-timer">
                <div id="runTimer">0.00 sec</div>
            </Paper>
            <div className="desktop-hud__top-left-container">
                <button className="composite-button white" onClick={onExitGame}>
                    Exit
                </button>
            </div>
            <IconButton
                className="mobile-hud__button mobile-hud__arrow-left"
                onTouchStart={handleTouchStart('left')}
                onTouchEnd={handleTouchEnd('left')}
                disableTouchRipple
            >
                <ArrowForwardIosIcon />
            </IconButton>
            <IconButton
                className="mobile-hud__button mobile-hud__jump"
                onTouchStart={handleTouchStart('jump')}
                onTouchEnd={handleTouchEnd('jump')}
                disableTouchRipple
            >
                <SpaceBarIcon />
            </IconButton>
            <IconButton
                className="mobile-hud__button mobile-hud__arrow-right"
                onTouchStart={handleTouchStart('right')}
                onTouchEnd={handleTouchEnd('right')}
                disableTouchRipple
            >
                <ArrowForwardIosIcon />
            </IconButton>
            {isMobileInteractButtonAdded && (
                <Paper className="mobile-hud__interact-button">
                    <ButtonGroup>
                        <Button
                            size="large"
                            onTouchStart={handleTouchStart('interact')}
                            onTouchEnd={handleTouchEnd('interact')}
                        >
                            <VisibilityIcon fontSize="small" />
                        </Button>
                    </ButtonGroup>
                </Paper>
            )}
            {withSwitchPlayer && (
                <Paper className="mobile-hud__switch-player">
                    <ButtonGroup>
                        <Button
                            size="large"
                            onClick={wrapperBlurEvent(handleClickSwitchPlayer)}
                        >
                            <SwitchAccountIcon fontSize="small" />
                        </Button>
                    </ButtonGroup>
                </Paper>
            )}
            <Paper className="mobile-hud__reset-position">
                <ButtonGroup>
                    <Button
                        size="large"
                        onClick={wrapperBlurEvent(handleClickResetPosition)}
                        title="Reset players position (BACKSPACE)"
                    >
                        <RestartAltIcon fontSize="small" />
                    </Button>
                </ButtonGroup>
            </Paper>
        </div>
    );
};
