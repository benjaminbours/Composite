'use client';
// vendors
import React, { useMemo, useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import validator from '@rjsf/validator-ajv8';
import { Form } from '@rjsf/mui';
import type { IChangeEvent } from '@rjsf/core';
import type { FormValidation } from '@rjsf/utils';
import type { JSONSchema7 } from 'json-schema';
import classNames from 'classnames';
import { useSearchParams, useRouter } from 'next/navigation';
// project
import { getDictionary } from '../../getDictionary';
import { useStoreActions } from '../hooks';
import { Route } from '../types';
import { generateErrorForm } from '../utils/errors';
import { generateErrorNotification } from '../utils/errors/generateErrorNotification';

interface State {
    password: string;
    confirmPassword: string;
}

interface Props {
    className?: string;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
}

export const NewPasswordForm: React.FC<Props> = ({ className, dictionary }) => {
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const queryParams = useSearchParams();
    const updatePassword = useStoreActions(
        (actions) => actions.user.updatePassword,
    );
    const [isLoading, setIsLoading] = useState(false);

    const generateInitialState = useCallback(
        () => ({
            password: '',
            confirmPassword: '',
        }),
        [],
    );
    const [state, setState] = useState<State>(generateInitialState());

    // TODO: add confirmation on submit as it is a dangerous action
    const handleSubmit = useCallback(
        (e: IChangeEvent<State>) => {
            const resetToken = queryParams.get('token');
            if (!e.formData || !resetToken) {
                return;
            }
            const { password } = e.formData;
            setIsLoading(true);
            updatePassword({
                resetPasswordToken: resetToken,
                updatePasswordDto: { password },
            })
                .then(() => {
                    enqueueSnackbar(
                        dictionary.notification['success-new-password'],
                        {
                            variant: 'success',
                        },
                    );
                    setState(generateInitialState());
                    router.push(Route.LOGIN);
                })
                .catch(async (error: any) => {
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
        [
            queryParams,
            updatePassword,
            enqueueSnackbar,
            dictionary,
            generateInitialState,
            router,
        ],
    );

    const schema: JSONSchema7 = useMemo(
        () => ({
            type: 'object',
            required: ['password', 'confirmPassword'],
            properties: {
                password: {
                    type: 'string',
                    title: dictionary.form.label.password,
                    readOnly: isLoading,
                    minLength: 8,
                },
                confirmPassword: {
                    type: 'string',
                    title: dictionary.form.label['confirm-password'],
                    readOnly: isLoading,
                    minLength: 8,
                },
            },
        }),
        [isLoading, dictionary],
    );

    const uiSchema = {
        password: {
            'ui:widget': 'password',
        },
        confirmPassword: {
            'ui:widget': 'password',
        },
    };

    const handleChange = useCallback((e: IChangeEvent) => {
        setState(e.formData);
    }, []);

    const handleValidate = useCallback(
        (formData: State, errors: FormValidation) => {
            // confirm password check
            if (formData.password !== formData.confirmPassword) {
                console.log(errors);
                errors.confirmPassword?.addError(
                    dictionary.form.validation['password-miss-match'],
                );
            }

            return errors;
        },
        [dictionary],
    );

    const cssClass = classNames({
        'new-password-form': true,
        ...(className ? { [className]: true } : {}),
    });

    return (
        <Form
            className={cssClass}
            formData={state}
            schema={schema}
            uiSchema={uiSchema}
            transformErrors={generateErrorForm(dictionary)}
            showErrorList={false}
            onChange={handleChange}
            onSubmit={handleSubmit}
            customValidate={handleValidate}
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
                    {dictionary.form.button['update-password']}
                </Button>
            )}
        </Form>
    );
};
