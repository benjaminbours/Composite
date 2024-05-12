import Script from 'next/script';
import './styles/main.scss';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            {process.env.NEXT_PUBLIC_STAGE !== 'development' && (
                <>
                    {/* <!-- Google tag (gtag.js) --> */}
                    <Script
                        async
                        src="https://www.googletagmanager.com/gtag/js?id=G-8YTQH59D71"
                        strategy="lazyOnload"
                    />
                    <Script
                        id="google-analytics"
                        dangerouslySetInnerHTML={{
                            __html: `window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());

                                gtag('config', 'G-8YTQH59D71');`,
                        }}
                    />
                </>
            )}
            <body data-app-version={process.env.APP_VERSION}>{children}</body>
        </html>
    );
}
