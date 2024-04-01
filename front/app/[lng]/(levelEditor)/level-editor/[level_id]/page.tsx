import type { Metadata } from 'next';
import { LevelEditor } from '../LevelEditor';
import { getDictionary } from '../../../../../getDictionary';
import { Locale } from '../../../../../i18n-config';

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

export default async function LevelEditorPage({
    params: { lng, level_id },
}: Props) {
    const dictionary = await getDictionary(lng);
    return <LevelEditor dictionary={dictionary.common} level_id={level_id} />;
}
