import Head from 'next/head';

export default async function Share({ params: { levelId } }: any) {
    const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/thumbnails/level_${levelId}_thumbnail.png`;
    const title = `Level ${levelId}`;
    const description =
        'I just finished this level on Composite the game! Did you try it?';
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@publisher_handle" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={imageUrl} />
            </Head>
        </>
    );
}
