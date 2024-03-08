// vendors
import type { Metadata } from 'next';
// project
import { TopBar } from '../../../02_molecules/TopBar/TopBar';
import { getDictionary } from '../../../../getDictionary';
import { Locale } from '../../../../i18n-config';
import { CentralContentTemplate } from '../../../04_templates/CentralContentTemplate';
import { EmailValidationForm } from '../../../03_organisms/EmailValidationForm';
import Paper from '@mui/material/Paper';

export const metadata: Metadata = {
    title: 'Composite - The game - Login',
    description:
        'Connect to your account to play with your friends or with random people, and access the level you created',
};

interface Props {
    params: {
        lng: Locale;
    };
}

export default async function SignUpEmailActivated({ params: { lng } }: Props) {
    const dictionary = await getDictionary(lng);

    return (
        <>
            <TopBar dictionary={dictionary.common} />
            <CentralContentTemplate className="sign-up-email-validation-page">
                <Paper className="form-padding" elevation={10}>
                    <h1>{dictionary['sign-up-email-validation'].title}</h1>
                    <p>{dictionary['sign-up-email-validation'].description}</p>
                    <h2 className="title-5">
                        {
                            dictionary['sign-up-email-validation'][
                                'no-received-email'
                            ]
                        }
                    </h2>
                    <EmailValidationForm dictionary={dictionary.common} />
                </Paper>
            </CentralContentTemplate>
        </>
    );
}
