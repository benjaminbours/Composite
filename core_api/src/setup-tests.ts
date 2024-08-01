import * as dotenv from 'dotenv';

dotenv.config();

// // test key from https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
// process.env.RECAPTCHA_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
process.env.PORT = '3001';
process.env.STAGE = 'test';

// jest.setTimeout(20000);
