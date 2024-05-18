import React, { useCallback } from 'react';
import Paper from '@mui/material/Paper';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
// import KeyboardIcon from '@mui/icons-material/Keyboard';
import App from './App';
import { wrapperBlurEvent } from '../[lng]/(levelEditor)/level-editor/utils';

interface Props {
    appRef: React.MutableRefObject<App | undefined>;
    onExitGame: () => void;
    withActionsContainer: boolean;
}

export const DesktopHUD: React.FC<Props> = ({
    appRef,
    withActionsContainer,
    onExitGame,
}) => {
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

    return (
        <div className="desktop-hud">
            <div className="desktop-hud__top-left-container">
                <button className="composite-button white" onClick={onExitGame}>
                    Exit
                </button>
            </div>
            {withActionsContainer && (
                <Paper className="desktop-hud__actions-container">
                    <ButtonGroup>
                        {/* <Button
                        onClick={wrapperBlurEvent(toggleTestMode)}
                        title="Play / Stop"
                    >
                        {state.appMode === AppMode.EDITOR ? (
                            <PlayCircleIcon />
                        ) : (
                            <StopCircleIcon />
                        )}
                    </Button> */}
                        <Button
                            onClick={wrapperBlurEvent(handleClickSwitchPlayer)}
                            title="Switch player (CTRL + O)"
                        >
                            <SwitchAccountIcon fontSize="small" />
                        </Button>
                        <Button
                            onClick={wrapperBlurEvent(handleClickResetPosition)}
                            title="Reset players position (BACKSPACE)"
                        >
                            <RestartAltIcon fontSize="small" />
                        </Button>
                        {/* <Button
                        // onClick={wrapperBlurEvent(toggleShortcut)}
                        title="Display shortcuts"
                        // color={state.isShortcutVisible ? 'success' : 'primary'}
                    >
                        <KeyboardIcon fontSize="small" />
                    </Button> */}
                    </ButtonGroup>
                </Paper>
            )}
        </div>
    );
};
