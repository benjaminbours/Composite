'use client';
// vendors
import React, { useCallback, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import type { JSONSchema7 } from 'json-schema';
import { IChangeEvent } from '@rjsf/core';
import { Form } from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
// project
// import { generateErrorNotification } from '../../utils/errors';
import { CircularProgress } from '@mui/material';
import { getDictionary } from '../../getDictionary';
import { useStoreActions } from '../hooks';
import { generateErrorNotification } from '../utils/errors/generateErrorNotification';

interface State {
    email: string;
}

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const EmailValidationForm: React.FC<Props> = ({ dictionary }) => {
    const { enqueueSnackbar } = useSnackbar();
    // force user to non null as the template is wrapped in RequireAuth component
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState<State>({
        email: '',
    });
    const resendEmailValidation = useStoreActions(
        (actions) => actions.user.resendEmailValidation,
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

    const handleChange = useCallback((e: IChangeEvent<State>) => {
        if (!e.formData) {
            return;
        }
        setState(e.formData);
    }, []);

    const handleSubmit = useCallback(
        (e: IChangeEvent<State>) => {
            if (!e.formData) {
                return;
            }
            setIsLoading(true);
            resendEmailValidation(e.formData.email)
                .then(() => {
                    enqueueSnackbar(
                        dictionary.notification[
                            'success-resend-validation-email'
                        ].replace('{{email}}', e.formData!.email),
                        {
                            variant: 'success',
                        },
                    );
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
        [enqueueSnackbar, resendEmailValidation, dictionary],
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
                    {dictionary.form.button['resend-confirmation-email']}
                </Button>
            )}
        </Form>
    );
};
