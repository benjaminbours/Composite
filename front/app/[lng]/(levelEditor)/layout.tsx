import { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import '../../styles/main.scss';
import { WithMainApp } from '../../WithMainApp';
import { i18n, type Locale } from '../../../i18n-config';
import { getDictionary } from '../../../getDictionary';

export async function generateStaticParams() {
    return i18n.locales.map((lng) => ({ lng }));
}

export const metadata: Metadata = {
    title: 'Next.js',
    description: 'Generated by Next.js',
};

export default async function RootLayout({
    children,
    params: { lng },
}: {
    children: React.ReactNode;
    params: { lng: Locale };
}) {
    const dictionary = await getDictionary(lng);
    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <WithMainApp dictionary={dictionary} lng={lng}>
                {children}
            </WithMainApp>
        </AppRouterCacheProvider>
    );
}
