/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

const defaults = {
  username: 'root',
  // Defaults align with `docker-compose.yml` in the repo root (MySQL on host port 3307).
  password: 'rootpass',
  database: 'fashion_app',
  host: '127.0.0.1',
  port: 3307
};

function envOrDefault(key, fallback) {
  const value = process.env[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'string' && value.trim() === '') return fallback;
  return value;
}

function readRawEnv(key) {
  return process.env[key];
}

function buildDbConfig() {
  return {
    username: envOrDefault('DB_USER', defaults.username),
    password: envOrDefault('DB_PASSWORD', defaults.password),
    database: envOrDefault('DB_NAME', defaults.database),
    host: envOrDefault('DB_HOST', defaults.host),
    port: Number(envOrDefault('DB_PORT', String(defaults.port))),
    dialect: 'mysql',
    logging: false
  };
}

/**
 * Sequelize CLI loads *all* exported environments when tooling runs.
 * Throwing in the `production` export breaks local dev unless every machine
 * has production env vars defined.
 *
 * Keep `sequelize.config.js` non-throwing, and enforce production invariants
 * at application startup (see `assertProductionDatabaseEnvOrThrow()`).
 */
function assertProductionDatabaseEnvOrThrow() {
  const missing = [];
  const username = readRawEnv('DB_USER');
  const database = readRawEnv('DB_NAME');
  const host = readRawEnv('DB_HOST');
  const password = readRawEnv('DB_PASSWORD');

  if (username === undefined || username === null || String(username).trim() === '') missing.push('DB_USER');
  if (database === undefined || database === null || String(database).trim() === '') missing.push('DB_NAME');
  if (host === undefined || host === null || String(host).trim() === '') missing.push('DB_HOST');

  if (password === undefined || password === null || String(password).trim() === '') {
    const allowEmptyPassword =
      String(readRawEnv('DB_ALLOW_EMPTY_PASSWORD') || '')
        .trim()
        .toLowerCase() === 'true';

    if (!allowEmptyPassword) {
      missing.push('DB_PASSWORD');
    }
  }

  if (missing.length) {
    throw new Error(
      `Invalid/missing database configuration for production: ${missing.join(
        ', '
      )}. Set these in your deployment environment. If you truly require an empty DB password, set DB_ALLOW_EMPTY_PASSWORD=true (not recommended).`
    );
  }
}

module.exports = {
  development: buildDbConfig(),
  test: buildDbConfig(),
  production: buildDbConfig(),
  assertProductionDatabaseEnvOrThrow
};
