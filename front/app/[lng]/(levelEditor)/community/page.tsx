import HandymanIcon from '@mui/icons-material/Handyman';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import GroupsIcon from '@mui/icons-material/Groups';
import { getDictionary } from '../../../../getDictionary';
import { Locale } from '../../../../i18n-config';
import { TopBar } from '../../../02_molecules/TopBar';
import Link from 'next/link';
import { Route } from '../../../types';
import { LevelList } from './LevelList';
import { Footer } from '../../../02_molecules/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Composite - Community',
    description:
        'The portal to access any level created by the community, and to create your own.',
};

interface Props {
    params: {
        lng: Locale;
    };
}

export default async function Community({ params: { lng } }: Props) {
    const dictionary = await getDictionary(lng);

    return (
        <>
            <TopBar dictionary={dictionary.common} />
            <main className="community-page">
                <div className="main-container">
                    <h1 className="title-h1 text-important">Community</h1>
                    <section className="text-image-section">
                        <div className="text-image-section__text-container">
                            <h2 className="title-h2">
                                Empowering Creativity
                                <br />
                                and Collaboration
                            </h2>
                            <p>
                                One of the core ideas of Composite is to be a
                                collaborative project, from the{' '}
                                <a
                                    href="https://github.com/benjaminbours/Composite"
                                    className="inline-link"
                                    target="_blank"
                                >
                                    codebase
                                </a>{' '}
                                to the content of the game itself.
                            </p>
                            <div className="community-page__intro-buttons">
                                <button className="composite-button composite-button--large main-action">
                                    Discover
                                    <ArrowDownwardIcon className="composite-button__end-icon" />
                                </button>
                                <Link href={Route.LEVEL_EDITOR_ROOT}>
                                    <button className="composite-button composite-button--large main-action">
                                        Create
                                        <HandymanIcon className="composite-button__end-icon" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <div className="text-image-section__image-container">
                            <GroupsIcon className="text-image-section__image" />
                        </div>
                    </section>
                    <section className="community-page__level-list">
                        <h2 className="title-h2">
                            Levels created by the community
                        </h2>
                        <LevelList dictionary={dictionary} />
                    </section>
                </div>
            </main>
            <Footer lng={lng} />
        </>
    );
}
