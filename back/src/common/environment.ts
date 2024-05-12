import { Logger } from '@nestjs/common';

const REQUIRED_ENV_VARS = [
  // API variables
  'PORT',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'STAGE',
  'CLIENT_URL',
  'SERVER_URL',
  // MAIL
  'SENDER_EMAIL',
  'SENDER_EMAIL_KEY',
] as const;

const OPTIONAL_ENV_VARS = [''] as const;

function buildEnvironment(): ENVIRONMENT {
  const REQUIRED_ENVIRONMENT: Partial<REQUIRED_ENVIRONMENT> = {};
  for (const VAR_NAME of REQUIRED_ENV_VARS) {
    const value = process.env[VAR_NAME];
    if (!value) {
      throw new Error(`Env variable ${VAR_NAME} not defined`);
    }
    REQUIRED_ENVIRONMENT[VAR_NAME] = value;
  }

  const OPTIONAL_ENVIRONMENT: Partial<OPTIONAL_ENVIRONMENT> = {};
  for (const VAR_NAME of OPTIONAL_ENV_VARS) {
    const value = process.env[VAR_NAME];
    if (!value) {
      Logger.log(`Optional env variable ${VAR_NAME} not defined`);
    }
    OPTIONAL_ENVIRONMENT[VAR_NAME] = value;
  }
  return {
    ...(REQUIRED_ENVIRONMENT as REQUIRED_ENVIRONMENT),
    ...(OPTIONAL_ENVIRONMENT as OPTIONAL_ENVIRONMENT),
  };
}

type REQUIRED_ENVIRONMENT = Record<(typeof REQUIRED_ENV_VARS)[number], string>;
type OPTIONAL_ENVIRONMENT = Record<
  (typeof OPTIONAL_ENV_VARS)[number],
  string | undefined
>;
type ENVIRONMENT = REQUIRED_ENVIRONMENT & OPTIONAL_ENVIRONMENT;

export const ENVIRONMENT = buildEnvironment();
