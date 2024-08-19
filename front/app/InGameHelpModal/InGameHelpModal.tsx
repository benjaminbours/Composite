import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React, { useCallback, useState } from 'react';
import { DesktopMotions } from './DesktopMotions';
import { Mechanics } from './Mechanics';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
    getShouldDisplayHelpOnLoad,
    hideInGameHelpModalKey,
} from '../constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isSoloMode: boolean;
}

export const InGameHelpModal: React.FC<Props> = ({
    isOpen,
    isSoloMode,
    onClose,
}) => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleChangeTab = useCallback(
        (_e: React.SyntheticEvent, newValue: number) => {
            setCurrentTab(newValue);
        },
        [],
    );

    return (
        <Modal
            className="composite-modal in-game-help-modal"
            open={isOpen}
            onClose={onClose}
        >
            <Paper className="composite-modal__container">
                <IconButton
                    className="close-button in-game-help"
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
                <h2 className="title-h2 text-important">Help</h2>
                <Tabs
                    value={currentTab}
                    className="in-game-help-modal__tabs"
                    onChange={handleChangeTab}
                >
                    <Tab label="Actions" />
                    <Tab label="Mechanics" />
                </Tabs>
                {currentTab === 0 && <DesktopMotions isSoloMode={isSoloMode} />}
                {currentTab === 1 && <Mechanics />}
                <FormControlLabel
                    control={
                        <Checkbox
                            defaultChecked={!getShouldDisplayHelpOnLoad()}
                        />
                    }
                    label={<p>{"Don't show this again"}</p>}
                    onChange={(_, checked) => {
                        console.log("Don't show this again", checked);
                        if (checked) {
                            window.localStorage.setItem(
                                hideInGameHelpModalKey,
                                '1',
                            );
                        } else {
                            window.localStorage.removeItem(
                                hideInGameHelpModalKey,
                            );
                        }
                    }}
                />
            </Paper>
        </Modal>
    );
};
