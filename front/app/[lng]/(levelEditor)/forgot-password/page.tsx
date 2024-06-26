// vendors
import type { Metadata } from 'next';
import Paper from '@mui/material/Paper';
// project
import { getDictionary } from '../../../../getDictionary';
import { ForgotPasswordForm } from '../../../03_organisms/ForgotPasswordForm';
import { Locale } from '../../../../i18n-config';
import { TopBar } from '../../../02_molecules/TopBar/TopBar';
import { CentralContentTemplate } from '../../../04_templates/CentralContentTemplate';
import { Footer } from '../../../02_molecules/Footer';

export const metadata: Metadata = {
    title: 'Composite - The game - Reset password',
    description: 'Reset your password',
};

interface Props {
    params: {
        lng: Locale;
    };
}

export default async function ForgotPassword({ params: { lng } }: Props) {
    const dictionary = await getDictionary(lng);

    return (
        <div className="layout-root">
            <TopBar dictionary={dictionary.common} />
            <CentralContentTemplate>
                <Paper className="form-padding" elevation={10}>
                    <h1 className="title-1">
                        {dictionary['forgot-password'].title}
                    </h1>
                    <p>{dictionary['forgot-password'].description}</p>
                    <ForgotPasswordForm dictionary={dictionary.common} />
                </Paper>
            </CentralContentTemplate>
            <Footer lng={lng} />
        </div>
    );
}
