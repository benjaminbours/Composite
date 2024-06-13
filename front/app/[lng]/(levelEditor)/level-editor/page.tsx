import { Metadata } from 'next';
import { getDictionary } from '../../../../getDictionary';
import { Locale } from '../../../../i18n-config';
import { TopBar } from '../../../02_molecules/TopBar/TopBar';
import { LevelList } from './LevelList';
import { Footer } from '../../../02_molecules/Footer';

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

export default async function LevelEditorDashboard({ params: { lng } }: Props) {
    const dictionary = await getDictionary(lng);
    return (
        <>
            <TopBar dictionary={dictionary.common} />
            <main className="level-editor-dashboard">
                <div className="content-container">
                    <h1 className="title-h1">{`Level editor`}</h1>
                    <h2 className="title-h2">{`My levels`}</h2>
                    <LevelList isCurrentUserList dictionary={dictionary} />
                </div>
                <Footer lng={lng} />
            </main>
        </>
    );
}
