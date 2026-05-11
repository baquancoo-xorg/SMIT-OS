# SMIT-OS Project Instructions

## Server & Development

### Ports
- **App Server:** localhost:3000 (default, override with `PORT` env var)
- **Database:** localhost:5435 (PostgreSQL via Docker)

### Start Development

Dev server tự chạy qua LaunchAgent `com.smitos.dev` sau khi login (xem `docs/dev-daemon-setup.md`). User chỉ cần bật **Docker Desktop** (đã set auto-start) và **Tailscale**.

Manual chỉ khi debug hoặc daemon đã uninstall:
```bash
# Start DB container first (if not running)
docker-compose up -d

# Start dev server with hot-reload
npm run dev
```

### Daemon commands
- `npm run daemon:status` — kiểm tra state + pid
- `npm run daemon:logs` — tail log (`~/Library/Logs/smit-os-dev.{out,err}.log`)
- `npm run daemon:restart` — restart sau khi sửa script
- `npm run daemon:install` / `npm run daemon:uninstall` — cài / gỡ
- Setup chi tiết: `docs/dev-daemon-setup.md`

### Hot-Reload Behavior
- Server uses `tsx watch` with ignore patterns (logs, dist, node_modules, .claude)
- Auto-restarts on `.ts` file changes
- No manual restart needed after code changes
- Wait 1-2 seconds for server to restart before testing

## Database

### Docker Container
- Container name: `smit_os_db`
- Image: `postgres:15-alpine`
- Volume: `/Users/dominium/Documents/database`

### Commands
```bash
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
npm run db:setup     # Setup initial admin user
```

### Connection String
```
postgresql://postgres:password@localhost:5435/smitos_db
```

## Cloudflare Tunnel

Domain `qdashboard.smitbox.com` → `localhost:3000` qua launchd daemon `com.cloudflare.cloudflared`. Auto-start on boot, auto-restart on crash.

### Quick commands
- `npm run tunnel:status` — check daemon load state
- `npm run tunnel:restart` — restart daemon (sau network change nếu cần)
- `npm run tunnel:logs` — stream logs
- `npm run tunnel:start` / `npm run tunnel:stop` — bootstrap / bootout

### Setup mới hoặc full reset
Xem `docs/cloudflare-tunnel-setup.md`.

### Khi 502/521/1033
1. App `:3000` đang chạy? → `npm run dev`
2. Tunnel up? → `npm run tunnel:status`
3. Vẫn fail? → `npm run tunnel:restart` + đợi 30s
4. Counter `total_requests` = 0 (xem metrics `127.0.0.1:20241`) → vấn đề Dashboard, xem docs

## After Code Changes

Server hot-reload handles restart automatically. If server is not running:
```bash
npm run dev
```

## Tech Stack
- React 19 + TypeScript + TailwindCSS v4
- Express 5 + Prisma ORM
- PostgreSQL 15

## UI v4 (default 2026-05-12)
- Root `/` redirects to `/v4/dashboard`. Pages live in `src/pages-v4/`, design system in `src/design/v4/`.
- v3 pages remain alive at original paths (`/dashboard`, `/leads`, `/settings`, ...) for 7-day eval window — delete after user confirmation.
- v4 tokens scoped under `[data-ui="v4"]`. Lint gate: `npm run lint:tokens` blocks raw Tailwind colors / radius / spacing under `src/design/v4/**` + `src/pages-v4/**`.
- Plan + reports: `plans/260512-0145-ui-rebuild-v4-foundation-first/`.

## API Keys & MCP Cowork

- API key system for external integrations (Claude Desktop/Cowork). See [docs/api-key-authentication.md](./docs/api-key-authentication.md).
- MCP server repo: `/Users/dominium/Documents/Project/smitos-mcp-server` (separate). Setup: [docs/mcp-cowork-integration.md](./docs/mcp-cowork-integration.md).
- Generate keys: Settings → API Keys (admin only).

## Important Notes
- Database uses real data, not mocks
- Admin user: `dominium`
- All Kanban boards connect to real DB
