'use client';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React, { useCallback, useState } from 'react';
import { LoginForm } from '../../03_organisms/LoginForm';
import { getDictionary } from '../../../getDictionary';
import { SignUpForm, WrapperReCaptcha } from '../../03_organisms/SignUpForm';

interface Props {
    isModalOpen: boolean;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const AuthModal: React.FC<Props> = ({ isModalOpen, dictionary }) => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleChangeTab = useCallback(
        (_e: React.SyntheticEvent, newValue: number) => {
            setCurrentTab(newValue);
        },
        [],
    );

    return (
        <Modal
            className="level-editor__auth-modal auth-modal"
            open={isModalOpen}
            onClose={() => {}}
        >
            <Paper className="auth-modal__container">
                <Typography variant="h6" component="h2">
                    In order to save your level, I need to know to whom it is
                </Typography>
                <Tabs
                    value={currentTab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChangeTab}
                >
                    <Tab label="Login" />
                    <Tab label="Register" />
                </Tabs>
                {currentTab === 0 && <LoginForm dictionary={dictionary} />}
                {currentTab === 1 && (
                    <WrapperReCaptcha lng="en">
                        <SignUpForm dictionary={dictionary} />
                    </WrapperReCaptcha>
                )}
            </Paper>
        </Modal>
    );
};
