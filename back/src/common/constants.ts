// our libs
// project
import { ENVIRONMENT } from './environment';

export const mailgunConstants = {
  username: ENVIRONMENT.MAILGUN_USER,
  key: ENVIRONMENT.MAILGUN_API_KEY,
  url: 'https://api.eu.mailgun.net',
};
