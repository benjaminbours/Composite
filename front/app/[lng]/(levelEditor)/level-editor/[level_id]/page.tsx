import type { Metadata } from 'next';
import { LevelEditor } from '../LevelEditor';
import { getDictionary } from '../../../../../getDictionary';
import { Locale } from '../../../../../i18n-config';
import { setupProjectEnv } from '../../../../utils/setup';
import { servicesContainer } from '../../../../core/frameworks/inversify.config';
import { ApiClient } from '../../../../core/services';
import { notFound } from 'next/navigation';
import { PartialLevel } from '../../../../types';

export const metadata: Metadata = {
    title: 'Composite - Level editor',
    description: 'Create your own level',
};

interface Props {
    params: {
        lng: Locale;
        level_id: string;
    };
}

async function getData(level_id: string): Promise<PartialLevel | undefined> {
    if (level_id === 'new') {
        const defaultLevel = {
            id: 0,
            name: '',
            data: [],
        };
        return defaultLevel;
    }

    setupProjectEnv('server');
    // inject services
    const apiClient = servicesContainer.get(ApiClient);
    // load level
    const level = await apiClient.defaultApi
        .levelsControllerFindOne({
            id: level_id,
        })
        .catch((error) => {
            console.error(error);
            return undefined;
        });
    return level;
}

export default async function LevelEditorPage({
    params: { lng, level_id },
}: Props) {
    const level = await getData(level_id);
    const dictionary = await getDictionary(lng);

    if (!level) {
        notFound();
    }

    return (
        <LevelEditor
            dictionary={dictionary.common}
            level_id={level_id}
            initialLevel={level}
        />
    );
}
