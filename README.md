# CPT_S-489-Fashion-App

## Description

**489 Fashion (Smart Wardrobe App)** is a React web application that lets users build a digital wardrobe, generate outfit recommendations using color-theory scoring, save outfits, organize them into boards, and browse a public inspiration feed. The current submission runs as a **localStorage-based prototype** (no backend required).

## Key features

- **Roles**: Guest browsing, Creator accounts, Admin tools (prototype logic)
- **Auth (prototype)**: Register + login flows stored in browser `localStorage`
- **Wardrobe**: Add, edit, delete, and filter clothing items (category, color, search)
- **Outfit generator**: Ranked outfit suggestions using color harmony + style/occasion rules (local scoring)
- **Saved outfits**: View/search/sort saved outfits and open outfit details
- **Boards**: Create boards (public/private), add outfits, view board details
- **Feed**: Browse public posts/boards and creator profiles
- **Admin**: User management and moderation queue (prototype logic)

## Quick start (recommended): React client (localStorage)

The **final submission** is the React app under `client/`. It is a **localStorage-based prototype** (no backend required to run locally).

### 1) Install dependencies

From `client/`:

```bash
cd client
npm install
```

### 2) Configure environment variables

This React app runs in **localStorage mode**, so **no `.env` is required** to run locally.

If you use the optional API server later, see the [Optional: Server + MySQL](#optional-server--mysql) section.

### 3) Start the application

```bash
cd client
npm run dev
```

Open the Vite URL it prints (default: `http://localhost:5173`).

---

## Optional: Server + MySQL

This repo also includes an optional **Express + Sequelize (MySQL)** server under `server/`. It is **not required** for the React localStorage submission, but it can be used as a foundation for a future API/DB version.

### Prereqs

- Node.js 18+ (you already have Node if `node -v` works)
- Docker Desktop (recommended for MySQL) OR a local MySQL install

### Restore / start the database (MySQL)

### Option A (recommended): MySQL via Docker

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

### Option B: Use your own MySQL

- Ensure MySQL is running
- Create a database named `fashion_app` (or set `DB_NAME` to a different one in `server/.env`)
- Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in `server/.env`

### Reset / restore database to a clean state

If you want a clean MySQL state using Docker:

```bash
docker compose down -v
docker compose up -d --force-recreate
```

This wipes the MySQL data volume and re-creates the `fashion_app` database.

### Restore database from dump (required for ZIP submissions that include the optional server)

An SQL dump is included at `database/fashion_app.sql`.

- **Docker restore**:

```bash
docker exec -i fashion-app-mysql mysql -uroot -prootpass < database/fashion_app.sql
```

- **Local MySQL restore** (if you installed MySQL directly):

```bash
mysql -u root -p < database/fashion_app.sql
```

### Configure environment variables

Create `server/.env` by copying `server/env.example` and adjusting values if needed:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `CORS_ORIGINS` (required if you run in production mode)

### Install dependencies

From `server/`:

```bash
cd server
npm install
```

### Start the server

From `server/`:

```bash
cd server
npm run dev
```

Open `http://localhost:3000/` (serves `Fashion-site/pages_html/home.html`).

### Notes

- `DB_SYNC=true` is a **development convenience** that auto-creates tables from Sequelize models. For a “real” submission, prefer migrations (`sequelize-cli`) and keep `DB_SYNC=false`.
- The server is optional for the React client; the React app currently uses browser `localStorage`.
- **CORS**: in `NODE_ENV=production`, set `CORS_ORIGINS` to your deployed site origin(s) (comma-separated). Development defaults to `http://localhost:$PORT` and `http://127.0.0.1:$PORT` if unset.
- **DB passwords in production**: blank `DB_PASSWORD` is rejected unless you explicitly set `DB_ALLOW_EMPTY_PASSWORD=true` (discouraged).
- **MySQL port**: the bundled `docker-compose.yml` maps MySQL to host port **3307**. If you don’t create `server/.env`, the server defaults match that compose file; if you use a local MySQL on **3306**, set `DB_PORT=3306` in `server/.env`.
