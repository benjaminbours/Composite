import { Metadata } from 'next';
import Paper from '@mui/material/Paper';
import { CentralContentTemplate } from '../../04_templates/CentralContentTemplate';
import { getDictionary } from '../../../getDictionary';
import { Locale } from '../../../i18n-config';
import { TopBar } from '../../02_molecules/TopBar';
import { SignUpForm, WrapperReCaptcha } from '../../03_organisms/SignUpForm';

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
        <>
            <TopBar />
            <CentralContentTemplate className="register-page">
                <Paper className="form-padding" elevation={10}>
                    <h1>{dictionary.register.title}</h1>
                    <WrapperReCaptcha lng={lng}>
                        <SignUpForm
                            dictionary={dictionary.common}
                            withSignIn
                            withRedirect
                        />
                    </WrapperReCaptcha>
                </Paper>
            </CentralContentTemplate>
        </>
    );
}
