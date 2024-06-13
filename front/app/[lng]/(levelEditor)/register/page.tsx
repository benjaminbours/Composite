import { Metadata } from 'next';
import { Suspense } from 'react';
import Paper from '@mui/material/Paper';
import { CentralContentTemplate } from '../../../04_templates/CentralContentTemplate';
import { getDictionary } from '../../../../getDictionary';
import { Locale } from '../../../../i18n-config';
import { TopBar } from '../../../02_molecules/TopBar/TopBar';
import { SignUpForm, WrapperReCaptcha } from '../../../03_organisms/SignUpForm';
import { Footer } from '../../../02_molecules/Footer';

export const metadata: Metadata = {
    title: 'Composite - The game - Register',
    description:
        'Create an account to create your own levels and access data history about your games',
};

interface Props {
    params: {
        lng: Locale;
    };
}

export default async function Register({ params: { lng } }: Props) {
    const dictionary = await getDictionary(lng);
    return (
        <div className="layout-root">
            <TopBar dictionary={dictionary.common} />
            <CentralContentTemplate className="register-page">
                <Paper className="form-padding" elevation={10}>
                    <h1>{dictionary.register.title}</h1>
                    <Suspense>
                        <WrapperReCaptcha lng={lng}>
                            <SignUpForm
                                dictionary={dictionary.common}
                                withSignIn
                                withRedirect
                            />
                        </WrapperReCaptcha>
                    </Suspense>
                </Paper>
            </CentralContentTemplate>
            <Footer lng={lng} />
        </div>
    );
}
