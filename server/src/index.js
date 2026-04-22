const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { PORT, NODE_ENV, STATIC_DIR, DB_SYNC } = require("./config");
const { sequelize } = require("./models");
const apiRouter = require("./routes/api");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function authenticateWithRetry() {
  const attempts = Number(process.env.DB_CONNECT_RETRIES || 30);
  const delayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 1000);

  let lastErr = null;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await sequelize.authenticate();
      return;
    } catch (err) {
      lastErr = err;
      const code = err?.parent?.code || err?.original?.code || err?.code;
      const retryable =
        code === 'ECONNREFUSED' ||
        code === 'ETIMEDOUT' ||
        code === 'PROTOCOL_CONNECTION_LOST';

      if (!retryable || i === attempts) break;

      // eslint-disable-next-line no-console
      console.warn(`[db] connect attempt ${i}/${attempts} failed (${code || 'unknown'}), retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  throw lastErr;
}

function parseCorsAllowlist() {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return null;

  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCorsMiddleware() {
  const isProd = NODE_ENV === "production";

  const configured = parseCorsAllowlist();
  const allowlist = new Set(
    configured && configured.length
      ? configured
      : [
          `http://localhost:${PORT}`,
          `http://127.0.0.1:${PORT}`,
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ],
  );

  if (isProd && (!configured || configured.length === 0)) {
    throw new Error(
      "CORS_ORIGINS must be set in production (comma-separated list), e.g. CORS_ORIGINS=https://yourdomain.com",
    );
  }

  return cors({
    credentials: true,
    origin(origin, callback) {
      // Non-browser clients (curl/postman) often omit Origin.
      if (!origin) return callback(null, true);

      if (allowlist.has(origin)) return callback(null, origin);

      return callback(null, false);
    },
  });
}

async function main() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(buildCorsMiddleware());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api", apiRouter);

  // Static site (existing prototype UI)
  app.use(express.static(STATIC_DIR));
  app.use(express.static(path.join(STATIC_DIR, "pages_html")));

  // Friendly entry route
  app.get("/", (req, res) => {
    res.sendFile(path.join(STATIC_DIR, "pages_html", "home.html"));
  });

  // If no API/static file matched, fall back to home (keeps deep links working when served)
  app.use((req, res) => {
    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.sendFile(path.join(STATIC_DIR, "pages_html", "home.html"));
  });

  if (process.env.SKIP_DB === 'true') {
    // eslint-disable-next-line no-console
    console.warn('[db] SKIP_DB=true — skipping Sequelize authenticate/sync (static site will still run).');
  } else {
    try {
      await authenticateWithRetry();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[db] Failed to connect to MySQL. Common fixes:');
      // eslint-disable-next-line no-console
      console.error('- Start MySQL (repo includes Docker: `docker compose up -d` from repo root)');
      // eslint-disable-next-line no-console
      console.error('- If you ran compose from `server/`, use repo root OR: `docker compose -f ..\\docker-compose.yml up -d`');
      // eslint-disable-next-line no-console
      console.error('- Create `server/.env` from `server/env.example` (note DB_PORT=3307 for the bundled compose file)');
      // eslint-disable-next-line no-console
      console.error('- Or temporarily run without DB: `SKIP_DB=true`');
      throw err;
    }

    if (DB_SYNC) {
      // Dev convenience: creates tables from models.
      // Turn off in production; prefer migrations.
      await sequelize.sync();
    }
  }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Fashion app server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Server failed to start:", err);
  process.exit(1);
});
