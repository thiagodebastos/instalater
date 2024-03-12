function getEnvVar(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

export const DB_HOST = getEnvVar("DB_HOST");
export const DB_PORT = getEnvVar("DB_PORT");
export const DB_USERNAME = getEnvVar("DB_USERNAME");
export const DB_PASSWORD = getEnvVar("DB_PASSWORD");
export const DB_NAME = getEnvVar("DB_NAME");
export const DATABASE_URL = getEnvVar("DATABASE_URL");
export const SESSION_SECRET = getEnvVar("SESSION_SECRET");
export const REDIS_HOST = getEnvVar("REDIS_HOST");
export const REDIS_PORT = getEnvVar("REDIS_PORT");
export const REDIS_PASSWORD = getEnvVar("REDIS_PASSWORD");
