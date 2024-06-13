import type { Metadata } from 'next';
import { Locale } from '../../../../../../i18n-config';
import { getDictionary } from '../../../../../../getDictionary';
import { TopBar } from '../../../../../02_molecules/TopBar';
import { setupProjectEnv } from '../../../../../utils/setup';
import { servicesContainer } from '../../../../../core/frameworks/inversify.config';
import { ApiClient } from '../../../../../core/services';
import { notFound } from 'next/navigation';
import { UsersFeedback } from './UsersFeedback';
import { LeaderBoard } from './LeaderBoard';
import { Footer } from '../../../../../02_molecules/Footer';
import { LevelImage } from './LevelImage';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import Link from 'next/link';
import { Route } from '../../../../../types';

export const metadata: Metadata = {
    title: 'Composite - Level editor',
    description: 'Create your own level',
};

export const revalidate = 1; // revalidate the data at most every hour

async function getData(level_id: string) {
    setupProjectEnv('server');
    // inject services
    const apiClient = servicesContainer.get(ApiClient);
    // load level
    const level = await apiClient.defaultApi
        .levelsControllerFindOne({
            id: level_id,
            stats: 'true',
        })
        .catch((error) => {
            console.error(error);
            return undefined;
        });
    return level;
}

interface Props {
    params: {
        lng: Locale;
        level_id: string;
    };
}

export default async function LevelEditorPage({
    params: { lng, level_id },
}: Props) {
    const level = await getData(level_id);
    const dictionary = await getDictionary(lng);

    if (!level) {
        notFound();
    }

    // TODO: highlight your own score
    // TODO: Add number of times the level has been played
    return (
        <>
            <TopBar dictionary={dictionary.common} />
            <main className="level-details-page">
                <div className="main-container">
                    <div className="level-details-page__header">
                        <Link
                            href={Route.COMMUNITY}
                            className="composite-button composite-button--small"
                        >
                            <KeyboardArrowLeftIcon className="composite-button__start-icon" />
                            Back to community
                        </Link>
                        <h1 className="title-h1 title-h1--important">
                            {level.name}
                        </h1>
                        <h4 className="title-h5 level-details-page__author">
                            Author: {level.author?.name}
                        </h4>
                    </div>
                    <div className="level-details-page__buttons-container">
                        <Link
                            href={Route.LOBBY_LEVEL(level.id)}
                            className="main-action composite-button composite-button--large"
                        >
                            Play
                        </Link>
                        <Link
                            href={Route.LEVEL_EDITOR(level.id)}
                            className="composite-button composite-button--large"
                        >
                            Build
                        </Link>
                    </div>
                    <LevelImage levelId={level.id} />
                    <UsersFeedback level={level} />
                    <LeaderBoard level={level} />
                    <div className="level-details-page__buttons-container">
                        <Link
                            href={Route.LOBBY_LEVEL(level.id)}
                            className="main-action composite-button composite-button--large"
                        >
                            Play
                        </Link>
                        <Link
                            href={Route.LEVEL_EDITOR(level.id)}
                            className="composite-button composite-button--large"
                        >
                            Build
                        </Link>
                    </div>
                </div>
            </main>
            <Footer lng={lng} />
        </>
    );
}
