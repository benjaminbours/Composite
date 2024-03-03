'use client';
// vendors
import React, { useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { Form } from '@rjsf/mui';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import type { IChangeEvent } from '@rjsf/core';
import type { FormValidation } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import type { JSONSchema7 } from 'json-schema';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
// project
import { useStoreActions } from '../hooks';
import { MAIL_REGEXP } from '../constants';
import { generateErrorForm } from '../utils/errors';
import { getDictionary } from '../../getDictionary';
import { Route } from '../types';
// import {
//     generateErrorNotification,
//     generateErrorForm,
// } from '../../utils/errors';

interface WrapperReCaptchaProps {
    children: React.ReactNode;
    lng: string;
}

export const WrapperReCaptcha: React.FC<WrapperReCaptchaProps> = ({
    children,
    lng,
}) => (
    <GoogleReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        language={lng}
        scriptProps={{
            async: true, // optional, default to false,
            defer: true, // optional, default to false
            appendTo: 'head', // optional, default to "head", can be "head" or "body",
            nonce: undefined, // optional, default undefined
        }}
    >
        {children}
    </GoogleReCaptchaProvider>
);

interface State {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface Props {
    className?: string;
    dictionary: Awaited<ReturnType<typeof getDictionary>>['common'];
    withRedirect?: boolean;
    withSignIn?: boolean;
}

export const SignUpForm: React.FC<Props> = ({
    className,
    dictionary,
    withSignIn,
    // withRedirect,
}) => {
    const router = useRouter();
    const queryParams = useSearchParams();
    const { enqueueSnackbar } = useSnackbar();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState<State>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [extraErrors, setExtraErrors] = useState<Record<string, any>>({});

    const signUp = useStoreActions((actions) => actions.user.signUp);

    const handleChange = useCallback((e: IChangeEvent) => {
        setState(e.formData);
    }, []);

    const handleSignUp = useCallback(
        async (e: IChangeEvent<State>) => {
            console.log('before check', executeRecaptcha);

            if (!e.formData) {
                return;
            }
            if (!executeRecaptcha) {
                return;
            }
            setIsLoading(true);

            const token = await executeRecaptcha('signUp');

            const payload = { ...e.formData };
            delete (payload as any).confirmPassword; // clean up useless field to send through network
            console.log('HERE before signup');

            signUp({
                ...payload,
                captcha: token,
            })
                .then(() => {
                    enqueueSnackbar(
                        dictionary.notification['success-sign-up'].replace(
                            '{{email}}',
                            payload.email,
                        ),
                        {
                            variant: 'success',
                        },
                    );
                    // if (withRedirect) {
                    //     router.replace(
                    //         {
                    //             pathname: '/sign-up-email-validation',
                    //         },
                    //         undefined,
                    //         { shallow: true },
                    //     );
                    // }
                })
                .catch((error: any) => {
                    console.error(error);
                    // enqueueSnackbar(generateErrorNotification(error, t), {
                    //     variant: 'error',
                    // });

                    const data = error.response?.data;
                    // TODO: copy pasted from generateErrorNotification. Can do better here
                    const errors = {} as any;
                    // if (data.statusCode === 409) {
                    //     errors.email = {};
                    //     errors.email.__errors = [
                    //         t('notification.unique-constraint-violation-email'),
                    //     ];
                    // }
                    setExtraErrors(errors);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [
            signUp,
            executeRecaptcha,
            enqueueSnackbar,
            dictionary,
            // router,
            // withRedirect,
        ],
    );

    const schema: JSONSchema7 = useMemo(
        () => ({
            type: 'object',
            required: ['name', 'email', 'password', 'confirmPassword'],
            properties: {
                name: {
                    type: 'string',
                    title: dictionary.form.label.name,
                    readOnly: isLoading,
                    description: dictionary.form.description.name,
                },
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

    const handleValidate = useCallback(
        (formData: State, errors: FormValidation) => {
            // email check
            const isEmailValid = formData.email.match(MAIL_REGEXP);
            if (!isEmailValid) {
                errors.email?.addError(dictionary.form.validation.email);
            }

            // confirm password check
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword?.addError(
                    dictionary.form.validation['password-miss-match'],
                );
            }

            return errors;
        },
        [dictionary],
    );

    return (
        <div className="signUp">
            <Form
                className={`signUp__form ${className}`}
                formData={state}
                schema={schema}
                uiSchema={uiSchema}
                showErrorList={false}
                transformErrors={generateErrorForm(dictionary)}
                onChange={handleChange}
                onSubmit={handleSignUp}
                customValidate={handleValidate}
                extraErrors={extraErrors}
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
                            {dictionary.form.button['create-account']}
                        </Button>
                    )}
                    {withSignIn && (
                        <Link
                            href={{
                                pathname: Route.LOGIN,
                                href: Route.LOGIN,
                                query: {
                                    ...(queryParams.get('from')
                                        ? { from: queryParams.get('from') }
                                        : {}),
                                },
                            }}
                        >
                            <Button
                                color="primary"
                                variant="outlined"
                                className="round-button"
                                fullWidth
                            >
                                {dictionary.form.button['sign-in']}
                            </Button>
                        </Link>
                    )}
                    <Link
                        href={{
                            pathname: Route.SIGN_UP_EMAIL_VALIDATION,
                            href: Route.SIGN_UP_EMAIL_VALIDATION,
                        }}
                    >
                        <Button
                            color="primary"
                            className="round-button signUp__form__emailValidationButton"
                            fullWidth
                        >
                            {dictionary.form.button['no-received-email']}
                        </Button>
                    </Link>
                </div>
            </Form>
        </div>
    );
};
