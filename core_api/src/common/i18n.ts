import { join } from 'path';
import { readdirSync, lstatSync } from 'fs';
import * as i18next from 'i18next';
import * as Backend from 'i18next-fs-backend';

// if no language parameter is passed, let's try to use the node.js system's locale
const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;

const localesFolder = join(process.cwd(), './locales');
i18next
  .use(Backend as any) // you can also use any other i18next backend, like i18next-http-backend or i18next-locize-backend
  .init({
    initImmediate: false, // setting initImediate to false, will load the resources synchronously
    fallbackLng: 'en',
    keySeparator: '.',

    // debug: true,
    preload: readdirSync(localesFolder).filter((fileName) => {
      const joinedPath = join(localesFolder, fileName);
      return lstatSync(joinedPath).isDirectory();
    }),
    backend: {
      loadPath: join(localesFolder, './{{lng}}/{{ns}}.json'),
    },
  });

export default (lng: string, ns?: string | string[]) =>
  i18next.getFixedT(lng || systemLocale, ns);
