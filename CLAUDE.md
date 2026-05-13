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
- React 19 + TypeScript + TailwindCSS
- Express 5 + Prisma ORM
- PostgreSQL 15

## Important Notes
- Database uses real data, not mocks
- Admin user: `dominium`
- All Kanban boards connect to real DB

## Docs Map (read on-demand)

**Quy tắc:** Trước khi edit, xác định task signal → dùng `Read` tool để load doc tương ứng MỘT LẦN → cite section trong plan/response. KHÔNG load tất cả docs vào context — chỉ load file cần thiết.

| Task signal | Must Read FIRST | Why |
|---|---|---|
| UI / component / button / màu / color / design / style / card / table / form / chart / icon / typography / theme / radius / spacing | `docs/ui-design-contract.md` | Visual + a11y + perf + render rules |
| API / endpoint / route / Express / Prisma / schema / migration / backend | `docs/system-architecture.md` + `docs/code-standards.md` | Stack + convention |
| New feature scope / PDR / goal / roadmap | `docs/project-overview-pdr.md` + `docs/development-roadmap.md` | Product intent + phases |
| Bug fix | `docs/code-standards.md` + relevant `docs/journals/*.md` | Convention + prior incident |
| Auth / API key / token | `docs/api-key-authentication.md` | Scope + middleware contract |
| MCP cowork integration | `docs/mcp-cowork-integration.md` | 7-phase plan + scopes |
| Codebase overview | `docs/codebase-summary.md` | File layout + module map |

**Top critical rules (always-on, không cần load full doc):**
- UI: NO solid orange CTA — primary = dark gradient + orange beam + orange icon
- UI: Card radius = `1.5rem` (dark) / `0.75rem` (light); Input = `1rem` / `0.75rem`
- UI: Accent canonical = `var(--brand-500)` OKLCH, KHÔNG hex hardcode
- UI: Mọi data section bọc `<Suspense fallback={Skeleton}>`, không fetch raw `useEffect`
- Code: Direct import, no barrel; file < 200 lines; kebab-case
- Data: Real DB, no mocks, no fake placeholders

**Khi xung đột contract vs playground v4:** playground thắng (trừ rule đánh dấu "forward target").
