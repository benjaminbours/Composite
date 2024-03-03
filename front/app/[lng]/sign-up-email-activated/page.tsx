// vendors
import type { Metadata } from 'next';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
// project
import { TopBar } from '../../02_molecules/TopBar';
import { getDictionary } from '../../../getDictionary';
import { Locale } from '../../../i18n-config';
import { CentralContentTemplate } from '../../04_templates/CentralContentTemplate';
import { Route } from '../../types';

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
            <TopBar />
            <CentralContentTemplate className="sign-up-email-activated-page">
                <Paper className="form-padding" elevation={10}>
                    <h1>{dictionary['sign-up-email-activated'].title}</h1>
                    <p>{dictionary['sign-up-email-activated'].description}</p>
                    <Link href={Route.LOGIN} legacyBehavior passHref>
                        <Button
                            color="primary"
                            variant="contained"
                            className="round-button"
                            fullWidth
                        >
                            {dictionary.common.form.button.login}
                        </Button>
                    </Link>
                </Paper>
            </CentralContentTemplate>
        </>
    );
}
