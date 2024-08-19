'use client';
// vendors
import React, { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { Form } from '@rjsf/mui';
import { IChangeEvent } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { FormValidation } from '@rjsf/utils';
import type { JSONSchema7 } from 'json-schema';
// project
import { useStoreActions } from '../hooks';
import { generateErrorForm } from '../utils/errors';
import { MAIL_REGEXP } from '../constants';
import { LoginDto } from '@benjaminbours/composite-core-api-client';
import type { getDictionary } from '../../getDictionary';
import { Route } from '../types';

interface State {
    email: string;
    password: string;
}

interface Props {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    withRedirect?: boolean;
    withSignUp?: boolean;
}

function isRelative(url: string) {
    return url && url.match(/^\/[^\/\\]/);
}

export const LoginForm: React.FC<Props> = ({
    dictionary,
    withRedirect,
    withSignUp,
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const queryParams = useSearchParams();

    const pathToRedirect = useMemo(
        () => queryParams.get('from') || '/',
        [queryParams],
    );

    const [state, setState] = useState<State>({
        email: '',
        password: '',
    });
    const schema: JSONSchema7 = useMemo(
        () => ({
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: {
                    type: 'string',
                    title: dictionary.form.label.email,
                    readOnly: isLoading,
                },
                password: {
                    type: 'string',
                    title: dictionary.form.label.password,
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
    };

    const handleChange = useCallback((e: IChangeEvent) => {
        setState(e.formData);
    }, []);

    const signIn = useStoreActions((state) => state.user.signIn);

    const handleSignIn = useCallback(
        (e: IChangeEvent<LoginDto>) => {
            if (!e.formData) {
                return;
            }
            setIsLoading(true);
            signIn(e.formData)
                .then(() => {
                    if (withRedirect && pathToRedirect) {
                        const href = isRelative(pathToRedirect as string)
                            ? (pathToRedirect as string)
                            : '/';
                        router.push(href);
                    }
                    enqueueSnackbar(dictionary.notification['success-login'], {
                        variant: 'success',
                    });
                })
                .catch((error: any) => {
                    console.error(error);
                    enqueueSnackbar(dictionary.notification['error-login'], {
                        variant: 'error',
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [
            enqueueSnackbar,
            signIn,
            pathToRedirect,
            dictionary,
            withRedirect,
            router,
        ],
    );

    const handleValidate = useCallback(
        (formData: State, errors: FormValidation) => {
            const isEmailValid = formData.email.match(MAIL_REGEXP);

            if (!isEmailValid) {
                errors.email?.addError(dictionary.form.validation.email);
            }
            return errors;
        },
        [dictionary],
    );

    return (
        <Form
            className="login-form"
            formData={state}
            schema={schema}
            uiSchema={uiSchema}
            transformErrors={generateErrorForm(dictionary)}
            showErrorList={false}
            onChange={handleChange}
            onSubmit={handleSignIn}
            customValidate={handleValidate}
            validator={validator}
        >
            <div className="buttons-container">
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        className="round-button"
                        fullWidth
                    >
                        {dictionary.form.button.login}
                    </Button>
                )}
                {withSignUp && (
                    <Link
                        href={{
                            pathname: Route.REGISTER,
                            href: Route.REGISTER,
                            query: {
                                ...(queryParams.get('from')
                                    ? { from: queryParams.get('from') }
                                    : {}),
                            },
                        }}
                        legacyBehavior
                        passHref
                    >
                        <Button
                            color="primary"
                            variant="outlined"
                            className="round-button"
                            fullWidth
                        >
                            {dictionary.form.button['create-account']}
                        </Button>
                    </Link>
                )}
                <Button
                    href={Route.FORGOT_PASSWORD}
                    target="_blank"
                    color="primary"
                    className="round-button"
                    fullWidth
                >
                    {dictionary.form.button['forgot-password']}
                </Button>
            </div>
        </Form>
    );
};
