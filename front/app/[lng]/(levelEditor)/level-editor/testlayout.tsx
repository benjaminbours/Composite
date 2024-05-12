import Script from 'next/script';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import '../../styles/main.scss';
import { WithMainApp } from '../../../WithMainApp';

// export default function LevelEditorLayout({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     return (
//         <>{children}</>
//         // <html lang="en">
//         //     {process.env.NEXT_PUBLIC_STAGE !== 'development' && (
//         //         <>
//         //             {/* <!-- Google tag (gtag.js) --> */}
//         //             <Script
//         //                 async
//         //                 src="https://www.googletagmanager.com/gtag/js?id=G-8YTQH59D71"
//         //                 strategy="lazyOnload"
//         //             />
//         //             <Script
//         //                 id="google-analytics"
//         //                 dangerouslySetInnerHTML={{
//         //                     __html: `window.dataLayer = window.dataLayer || [];
//         //                         function gtag(){dataLayer.push(arguments);}
//         //                         gtag('js', new Date());

//         //                         gtag('config', 'G-8YTQH59D71');`,
//         //                 }}
//         //             />
//         //         </>
//         //     )}
//         //     <body data-app-version={process.env.APP_VERSION}>
//         //         <AppRouterCacheProvider options={{ enableCssLayer: true }}>
//         //             <WithMainApp>{children}</WithMainApp>
//         //         </AppRouterCacheProvider>
//         //     </body>
//         // </html>
//     );
// }
