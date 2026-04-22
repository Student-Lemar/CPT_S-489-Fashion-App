#!/usr/bin/env bash
# dev.sh — start local MySQL, the Express server, and the React client
# Usage: ./dev.sh
# Stop:  Ctrl+C (kills server + client; MySQL keeps running)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$REPO_ROOT/server"
CLIENT_DIR="$REPO_ROOT/client"

# ── Colours ───────────────────────────────────────────────────────────────────
BOLD=$'\e[1m'; RESET=$'\e[0m'
RED=$'\e[31m'; GREEN=$'\e[32m'; YELLOW=$'\e[33m'; CYAN=$'\e[36m'

log()  { echo "${CYAN}${BOLD}[dev]${RESET} $*"; }
ok()   { echo "${GREEN}${BOLD}[dev]${RESET} $*"; }
warn() { echo "${YELLOW}${BOLD}[dev]${RESET} $*"; }
err()  { echo "${RED}${BOLD}[dev]${RESET} $*" >&2; }

# ── Cleanup on exit ──────────────────────────────────────────────────────────
SERVER_PID=""
CLIENT_PID=""

cleanup() {
  echo ""
  log "Shutting down…"
  [[ -n "$CLIENT_PID" ]] && kill "$CLIENT_PID" 2>/dev/null && log "React client stopped."
  [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null && log "Express server stopped."
  ok "Done. (MySQL is still running — stop it with: sudo systemctl stop mysql)"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── 1. Check dependencies ─────────────────────────────────────────────────────
for cmd in node npm mysqladmin; do
  if ! command -v "$cmd" &>/dev/null; then
    err "'$cmd' not found. Please install it and re-run this script."
    exit 1
  fi
done

# ── 2. Start local MySQL if not already running ───────────────────────────────
# Detect the service name (mysql or mariadb)
MYSQL_SVC=""
for svc in mysql mariadb mysqld; do
  if systemctl list-units --type=service 2>/dev/null | grep -q "${svc}.service"; then
    MYSQL_SVC="$svc"; break
  fi
done

if [[ -z "$MYSQL_SVC" ]]; then
  warn "Could not detect a MySQL/MariaDB systemd service."
  warn "Make sure MySQL is running manually, then re-run this script."
  exit 1
fi

if ! systemctl is-active --quiet "$MYSQL_SVC"; then
  log "Starting $MYSQL_SVC via systemctl (requires sudo)…"
  sudo systemctl start "$MYSQL_SVC"
fi

# ── 3. Create the database if it doesn't exist ───────────────────────────────
DB_NAME="fashion_app"
DB_USER="root"
DB_PASS="rootpass"

# Detect MySQL port from .env (default 3306 for local, not 3307 which is Docker)
DB_PORT=3306

if ! mysqladmin -h 127.0.0.1 -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" ping --silent 2>/dev/null; then
  warn "Cannot reach MySQL on port $DB_PORT with password 'rootpass'."
  warn "If your root password differs, edit DB_PASSWORD in server/.env and update this script."
  warn "Continuing anyway — the server will report a DB error if credentials are wrong."
else
  mysql -h 127.0.0.1 -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
    -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null \
    && ok "Database '${DB_NAME}' is ready." \
    || warn "Could not create database (may already exist — that's fine)."
fi

# ── 4. Create server/.env if missing ─────────────────────────────────────────
if [[ ! -f "$SERVER_DIR/.env" ]]; then
  warn "server/.env not found — creating from env.example…"
  cp "$SERVER_DIR/env.example" "$SERVER_DIR/.env"
  # Use standard local port 3306, not Docker's 3307
  sed -i 's|^DB_PORT=.*|DB_PORT=3306|' "$SERVER_DIR/.env"
  # Ensure CORS includes the Vite dev server origin
  sed -i 's|^CORS_ORIGINS=.*|CORS_ORIGINS=http://localhost:3001,http://localhost:5173|' "$SERVER_DIR/.env"
  # Enable DB_SYNC on first run so Sequelize creates tables
  sed -i 's|^DB_SYNC=.*|DB_SYNC=true|' "$SERVER_DIR/.env"
  ok "Created server/.env with DB_SYNC=true (tables will be auto-created on first start)."
else
  # Always make sure localhost:5173 is in CORS
  if ! grep -q "5173" "$SERVER_DIR/.env"; then
    sed -i 's|^CORS_ORIGINS=\(.*\)|\1,http://localhost:5173|' "$SERVER_DIR/.env"
    warn "Added http://localhost:5173 to CORS_ORIGINS in server/.env"
  fi
fi

# ── 5. Free ports 3000 and 5173 if already in use ────────────────────────────
for port in 3001 5173; do
  if ss -tlnp | grep -q ":${port}"; then
    warn "Port $port in use — attempting to free it…"
    # Extract PIDs directly from ss output (no sudo needed for own processes)
    pids=$(ss -tlnp | grep ":${port}" | grep -oP 'pid=\K[0-9]+' || true)
    if [[ -n "$pids" ]]; then
      echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
    sleep 0.8
  fi
done

# ── 6. Install dependencies (if node_modules missing) ────────────────────────
if [[ ! -d "$SERVER_DIR/node_modules" ]]; then
  log "Installing server dependencies…"
  npm --prefix "$SERVER_DIR" install
fi

if [[ ! -d "$CLIENT_DIR/node_modules" ]]; then
  log "Installing client dependencies…"
  npm --prefix "$CLIENT_DIR" install
fi

ok "MySQL is ready."

# ── 6. Start Express server ──────────────────────────────────────────────────
log "Starting Express server on http://localhost:3001 …"
npm --prefix "$SERVER_DIR" run dev > "$REPO_ROOT/server.log" 2>&1 &
SERVER_PID=$!

# Wait until /api/health responds
HC=0
until curl -sf http://localhost:3001/api/health &>/dev/null; do
  sleep 1
  HC=$((HC + 1))
  if [[ $HC -ge 20 ]]; then
    err "Server did not start in 20s. Logs:"
    tail -30 "$REPO_ROOT/server.log"
    exit 1
  fi
done
ok "Server is up. (logs → server.log)"

# ── 7. Start React (Vite) client ────────────────────────────────────────────
log "Starting React client on http://localhost:5173 …"
npm --prefix "$CLIENT_DIR" run dev > "$REPO_ROOT/client.log" 2>&1 &
CLIENT_PID=$!

ok ""
ok "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ok "  App running:"
ok "  Client  →  http://localhost:5173"
ok "  Server  → http://localhost:3001/api/health"
ok ""
ok "  Logs:   server.log  |  client.log"
ok "  Stop:   Ctrl+C"
ok "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Keep the script alive so trap fires on Ctrl+C
wait
