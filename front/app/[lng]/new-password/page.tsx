// vendors
import type { Metadata } from 'next';
import Paper from '@mui/material/Paper';
// project
import { getDictionary } from '../../../getDictionary';
import { Locale } from '../../../i18n-config';
import { NewPasswordForm } from '../../03_organisms/NewPasswordForm';
import { TopBar } from '../../02_molecules/TopBar/TopBar';
import { CentralContentTemplate } from '../../04_templates/CentralContentTemplate';

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
        <>
            <TopBar dictionary={dictionary.common} />
            <CentralContentTemplate>
                <Paper className="form-padding" elevation={10}>
                    <h1>{dictionary['new-password'].title}</h1>
                    <p>{dictionary['new-password'].description}</p>
                    <NewPasswordForm dictionary={dictionary.common} />
                </Paper>
            </CentralContentTemplate>
        </>
    );
}
