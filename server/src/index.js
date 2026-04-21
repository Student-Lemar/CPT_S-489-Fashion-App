const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { PORT, NODE_ENV, STATIC_DIR, DB_SYNC } = require("./config");
const { sequelize } = require("./models");
const apiRouter = require("./routes/api");

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

  await sequelize.authenticate();

  if (DB_SYNC) {
    // Dev convenience: creates tables from models.
    // Turn off in production; prefer migrations.
    await sequelize.sync();
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
