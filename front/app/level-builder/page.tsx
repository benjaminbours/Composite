import type { Metadata } from 'next';
import { LevelBuilder } from './LevelBuilder';

export const metadata: Metadata = {
    title: 'Composite - Level builder',
    description: 'Create your own level',
};

export default async function LevelBuilderCore() {
    return <LevelBuilder />;
}
