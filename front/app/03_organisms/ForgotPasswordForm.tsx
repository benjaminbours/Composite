'use client';
// vendors
import React from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { JSONSchema7 } from 'json-schema';
import { Form } from '@rjsf/mui';
import { Button, CircularProgress } from '@mui/material';
import { IChangeEvent } from '@rjsf/core';
import { useSnackbar } from 'notistack';
import validator from '@rjsf/validator-ajv8';
// project
import { getDictionary } from '../../getDictionary';
import { useStoreActions } from '../hooks';
import { generateErrorNotification } from '../utils/errors/generateErrorNotification';

interface State {
    email: string;
}

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const ForgotPasswordForm: React.FC<Props> = ({ dictionary }) => {
    const { enqueueSnackbar } = useSnackbar();

    const resetPassword = useStoreActions((store) => store.user.resetPassword);
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState<State>({
        email: '',
    });

    const generateInitialState = useCallback(
        () => ({
            email: '',
        }),
        [],
    );

    const schema: JSONSchema7 = useMemo(
        () => ({
            type: 'object',
            required: ['email'],
            properties: {
                email: {
                    type: 'string',
                    title: dictionary.form.label.email,
                    readOnly: isLoading,
                },
            },
        }),
        [isLoading, dictionary],
    );

    const handleChange = useCallback((e: IChangeEvent) => {
        setState(e.formData);
    }, []);

    const handleSubmit = useCallback(
        (e: IChangeEvent<State>) => {
            if (!e.formData) {
                return;
            }
            const { email } = e.formData;
            setIsLoading(true);
            resetPassword(email)
                .then((response) => {
                    console.log(response);
                    enqueueSnackbar(
                        dictionary.notification[
                            'success-reset-password-sent-email'
                        ],
                        {
                            variant: 'success',
                        },
                    );
                    setState(generateInitialState());
                })
                .catch(async (error: any) => {
                    console.error(error);
                    const errorData = await error.response.json();
                    enqueueSnackbar(
                        generateErrorNotification(errorData, dictionary),
                        {
                            variant: 'error',
                        },
                    );
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [enqueueSnackbar, generateInitialState, dictionary, resetPassword],
    );
    return (
        <Form
            formData={state}
            schema={schema}
            showErrorList={false}
            onChange={handleChange}
            onSubmit={handleSubmit}
            validator={validator}
        >
            {isLoading ? (
                <CircularProgress />
            ) : (
                <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    className="round-button"
                >
                    {dictionary.form.button['reset-password']}
                </Button>
            )}
        </Form>
    );
};
