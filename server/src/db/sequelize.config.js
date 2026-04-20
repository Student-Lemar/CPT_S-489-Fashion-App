/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

const defaults = {
  username: 'root',
  password: '',
  database: 'fashion_app',
  host: '127.0.0.1',
  port: 3306
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

function buildDbConfig({ strict }) {
  if (strict) {
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
        )}. Set these in your deployment environment (or unset NODE_ENV=production while developing). If you truly require an empty DB password, set DB_ALLOW_EMPTY_PASSWORD=true (not recommended).`
      );
    }

    const portRaw = readRawEnv('DB_PORT');
    const port = portRaw === undefined || portRaw === null || String(portRaw).trim() === ''
      ? defaults.port
      : Number(portRaw);

    return {
      username: String(username).trim(),
      password: password === undefined || password === null ? '' : String(password),
      database: String(database).trim(),
      host: String(host).trim(),
      port,
      dialect: 'mysql',
      logging: false
    };
  }

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

module.exports = {
  development: buildDbConfig({ strict: false }),
  production: buildDbConfig({ strict: true })
};
