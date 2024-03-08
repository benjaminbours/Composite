import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Composite - The game',
    description:
        "In this 2.5D platformer game, two players will embody the essence of light and shadow, with one player representing light and the other embodying shadow. The game's mechanics are designed to leverage the interplay between these two elements, creating a cooperative and immersive experience where your skills will be challenged.",
};

export default async function Home({ params: { lng } }: any) {
    return <></>;
}
