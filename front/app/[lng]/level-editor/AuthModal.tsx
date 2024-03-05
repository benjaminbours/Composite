import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { useCallback, useState } from 'react';
import { LoginForm } from '../../03_organisms/LoginForm';
import { getDictionary } from '../../../getDictionary';
import { SignUpForm } from '../../03_organisms/SignUpForm';

enum Mode {
    SIGN_IN,
    SIGN_UP,
}

interface Props {
    isModalOpen: boolean;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const AuthModal: React.FC<Props> = ({ isModalOpen, dictionary }) => {
    const [mode, setMode] = useState<Mode>(Mode.SIGN_IN);

    const onClickSignIn = useCallback(() => {
        setMode(Mode.SIGN_IN);
    }, []);

    const onClickSignUp = useCallback(() => {
        console.log('HERE');
        setMode(Mode.REGISTER);
    }, []);

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
                {mode === Mode.SIGN_IN && (
                    <LoginForm
                        dictionary={dictionary}
                        withSignUp={{ callback: onClickSignUp }}
                    />
                )}
                {mode === Mode.REGISTER && (
                    <SignUpForm
                        dictionary={dictionary}
                        withSignIn={{ callback: onClickSignIn }}
                    />
                )}
            </Paper>
        </Modal>
    );
};
