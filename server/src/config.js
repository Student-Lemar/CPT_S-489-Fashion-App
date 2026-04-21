require('dotenv').config();

const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';

// `../..` from `server/src` -> repo root
const REPO_ROOT = path.join(__dirname, '..', '..');
const STATIC_DIR = path.join(REPO_ROOT, 'Fashion-site');

const DB_SYNC = String(process.env.DB_SYNC || 'false').toLowerCase() === 'true';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

module.exports = {
  PORT,
  NODE_ENV,
  STATIC_DIR,
  DB_SYNC,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
