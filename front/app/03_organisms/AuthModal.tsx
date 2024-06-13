'use client';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React, { useCallback, useState } from 'react';
import { getDictionary } from '../../getDictionary';
import { SignUpForm, WrapperReCaptcha } from './SignUpForm';
import { LoginForm } from './LoginForm';
import { Button } from '@mui/material';
import { useStoreActions } from '../hooks';

interface Props {
    text: string;
    isModalOpen: boolean;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    withGuest?: boolean;
    onClose?: () => void;
}

export const AuthModal: React.FC<Props> = ({
    text,
    isModalOpen,
    dictionary,
    setIsModalOpen,
    withGuest,
    onClose,
}) => {
    const [currentTab, setCurrentTab] = useState(0);
    const setIsGuest = useStoreActions((store) => store.user.setIsGuest);

    const handleChangeTab = useCallback(
        (_e: React.SyntheticEvent, newValue: number) => {
            setCurrentTab(newValue);
        },
        [],
    );

    return (
        <Modal
            className="composite-modal"
            open={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                if (onClose) {
                    onClose();
                }
            }}
        >
            <Paper className="composite-modal__container">
                <Typography variant="h6" component="h2">
                    {text}
                </Typography>
                {withGuest && (
                    <Button
                        className="composite-modal__guest-button"
                        variant="contained"
                        fullWidth
                        onClick={() => {
                            setIsGuest(true);
                            setIsModalOpen(false);
                        }}
                    >
                        Continue as guest
                    </Button>
                )}
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
                        <SignUpForm
                            dictionary={dictionary}
                            onSuccess={() => {
                                setCurrentTab(1);
                            }}
                        />
                    </WrapperReCaptcha>
                )}
            </Paper>
        </Modal>
    );
};
