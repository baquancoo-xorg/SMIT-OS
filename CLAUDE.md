# SMIT-OS Project Instructions

## Server & Development

### Ports
- **App Server:** localhost:3000 (default, override with `PORT` env var)
- **Database:** localhost:5435 (PostgreSQL via Docker)

### Start Development
```bash
# Start DB container first (if not running)
docker-compose up -d

# Start dev server with hot-reload
npm run dev
```

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
- `npm run tunnel:status` — check daemon PID
- `npm run tunnel:restart` — restart daemon (sau network change nếu cần)
- `npm run tunnel:logs` — stream logs

### Setup mới hoặc full reset
Xem `docs/cloudflare-tunnel-setup.md`.

### Khi 502/521/1033
1. App `:3000` đang chạy? → `npm run dev`
2. Tunnel up? → `npm run tunnel:status`
3. Vẫn fail? → `npm run tunnel:restart` + đợi 30s

## After Code Changes

Server hot-reload handles restart automatically. If server is not running:
```bash
npm run dev
```

## Tech Stack
- React 19 + TypeScript + TailwindCSS
- Express 5 + Prisma ORM
- PostgreSQL 15

## Important Notes
- Database uses real data, not mocks
- Admin user: `dominium`
- All Kanban boards connect to real DB
