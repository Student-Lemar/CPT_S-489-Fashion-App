# CPT_S-489-Fashion-App

## Run the site with a local Node server (recommended)

This repo includes a small **Express + Sequelize (MySQL)** server under `server/` that serves the existing static UI from `Fashion-site/`.

### Prereqs

- Node.js 18+ (you already have Node if `node -v` works)
- MySQL running locally, with a database created (example name: `fashion_app`)

### Option A (easiest): MySQL via Docker

From the repo root:

```bash
docker compose up -d
```

If you are currently in `server/`, either `cd ..` first or run:

```bash
docker compose -f ../docker-compose.yml up -d
```

This starts MySQL on `localhost:3307` with:

- database: `fashion_app`
- user: `root`
- password: `rootpass`

### Setup

1. Create `server/.env` (copy from `server/env.example`) and set `DB_PASSWORD` if needed.
2. Install + start:

```bash
cd server
npm install
set DB_SYNC=true
npm run dev
```

Then open `http://localhost:3000/` (it serves `Fashion-site/pages_html/home.html`).

### Notes

- `DB_SYNC=true` is a **development convenience** that auto-creates tables from Sequelize models. For a “real” submission, prefer migrations (`sequelize-cli`) and keep `DB_SYNC=false`.
- The UI still uses browser `localStorage` today; the server is the foundation for moving data/auth to MySQL next.
- **CORS**: in `NODE_ENV=production`, set `CORS_ORIGINS` to your deployed site origin(s) (comma-separated). Development defaults to `http://localhost:$PORT` and `http://127.0.0.1:$PORT` if unset.
- **DB passwords in production**: blank `DB_PASSWORD` is rejected unless you explicitly set `DB_ALLOW_EMPTY_PASSWORD=true` (discouraged).
- **MySQL port**: the bundled `docker-compose.yml` maps MySQL to host port **3307**. If you don’t create `server/.env`, the server defaults match that compose file; if you use a local MySQL on **3306**, set `DB_PORT=3306` in `server/.env`.
- **No DB handy?** you can still run the static UI with `SKIP_DB=true` (skips Sequelize connect/sync).
