import React, { useCallback } from 'react';
import Paper from '@mui/material/Paper';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import App from './App';
import { wrapperBlurEvent } from '../[lng]/(levelEditor)/level-editor/utils';
import { Level } from '@benjaminbours/composite-core-api-client';

interface Props {
    appRef: React.MutableRefObject<App | undefined>;
    onExitGame: () => void;
    level: Level;
    withActionsContainer: boolean;
}

export const DesktopHUD: React.FC<Props> = ({
    appRef,
    withActionsContainer,
    level,
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
                <h2 className="title-h4 text-important">{level.name}</h2>
                <div id="runTimer">0.00 sec</div>
            </div>
            {withActionsContainer && (
                <Paper className="desktop-hud__actions-container">
                    <ButtonGroup>
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
                    </ButtonGroup>
                </Paper>
            )}
        </div>
    );
};
