// vendors
import type { Metadata } from 'next';
import Paper from '@mui/material/Paper';
import { Suspense } from 'react';
// project
import { getDictionary } from '../../../../getDictionary';
import { Locale } from '../../../../i18n-config';
import { NewPasswordForm } from '../../../03_organisms/NewPasswordForm';
import { TopBar } from '../../../02_molecules/TopBar/TopBar';
import { CentralContentTemplate } from '../../../04_templates/CentralContentTemplate';
import { Footer } from '../../../02_molecules/Footer';

export const metadata: Metadata = {
    title: 'Composite - The game - New password',
    description: 'Choose your new password.',
};

interface Props {
    params: {
        lng: Locale;
    };
}

export default async function NewPasswordPage({ params: { lng } }: Props) {
    const dictionary = await getDictionary(lng);
    return (
        <div className="layout-root">
            <TopBar dictionary={dictionary.common} />
            <CentralContentTemplate>
                <Paper className="form-padding" elevation={10}>
                    <h1>{dictionary['new-password'].title}</h1>
                    <p>{dictionary['new-password'].description}</p>
                    <Suspense>
                        <NewPasswordForm dictionary={dictionary.common} />
                    </Suspense>
                </Paper>
            </CentralContentTemplate>
            <Footer lng={lng} />
        </div>
    );
}
