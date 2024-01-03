import MainApp from './MainApp';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Composite - The game',
    description: 'TODO: Add description',
};

export default async function Home() {
    return (
        <main className="home-page">
            <MainApp />
        </main>
    );
}
