import { Metadata } from 'next';
import { Suspense } from 'react';
import Paper from '@mui/material/Paper';
import { CentralContentTemplate } from '../../../04_templates/CentralContentTemplate';
import { getDictionary } from '../../../../getDictionary';
import { LoginForm } from '../../../03_organisms/LoginForm';
import { Locale } from '../../../../i18n-config';
import { TopBar } from '../../../02_molecules/TopBar/TopBar';

export const metadata: Metadata = {
    title: 'Composite - The game - Login',
    description:
        'Connect to your account to play with your friends or with random people, and access the levels you created.',
};

interface Props {
    params: {
        lng: Locale;
    };
}

export default async function Login({ params: { lng } }: Props) {
    const dictionary = await getDictionary(lng);
    return (
        <>
            <TopBar dictionary={dictionary.common} />
            <CentralContentTemplate className="login-page">
                <Paper className="form-padding" elevation={10}>
                    <h1>{`Login`}</h1>
                    <Suspense>
                        <LoginForm
                            dictionary={dictionary.common}
                            withSignUp
                            withRedirect
                        />
                    </Suspense>
                </Paper>
            </CentralContentTemplate>
        </>
    );
}
