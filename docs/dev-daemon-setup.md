# Dev Server Auto-Start (LaunchAgent)

Sau khi login Mac Mini, dev server (`npm run dev` → `localhost:3000`) tự chạy qua launchd LaunchAgent `com.smitos.dev`. Không cần mở Terminal, không cần gõ lệnh.

User chỉ cần làm 2 việc thủ công sau khi boot:
1. Bật **Docker Desktop** (đã được cấu hình auto-start — xem mục cuối)
2. Bật **Tailscale** (đã có sẵn từ Tailscale macOS app)

---

## Architecture

```
Login macOS
   ↓
Docker Desktop (auto)              Tailscale (auto)
   ↓
DB container (restart: always) auto-up
   ↓
LaunchAgent com.smitos.dev (RunAtLoad)
   ↓
scripts/start-dev-daemon.sh
   ├─ Set PATH = /opt/homebrew/bin:...
   ├─ Wait DB ready (port 5435, max 5 phút, retry 5s)
   └─ exec npm run dev → localhost:3000
                              ↓
                    Cloudflare Tunnel (sẵn) → qdashboard.smitbox.com
```

- **LaunchAgent kind:** user-level (không cần sudo, an toàn hơn root daemon)
- **Plist source (in repo):** `scripts/com.smitos.dev.plist`
- **Plist installed:** `~/Library/LaunchAgents/com.smitos.dev.plist`
- **Wrapper script:** `scripts/start-dev-daemon.sh`
- **Logs:** `~/Library/Logs/smit-os-dev.{out,err}.log`

---

## Quick Commands

```bash
npm run daemon:install     # Cài + load (chạy 1 lần, hoặc sau khi sửa plist)
npm run daemon:uninstall   # Bootout + xoá plist
npm run daemon:status      # Xem state, pid, last exit code
npm run daemon:logs        # Tail cả out + err log
npm run daemon:restart     # Kickstart daemon (sau khi sửa script)
```

---

## Setup Mới Từ Đầu

### 1. Bật Docker Desktop auto-start

Mở **Docker Desktop** → click icon ⚙️ (Settings) → tab **General** → tick **"Start Docker Desktop when you sign in to your computer"** → **Apply & restart**.

Vì `docker-compose.yml` có `restart: always`, container `smit_os_db` sẽ tự up ngay khi Docker Desktop ready.

### 2. ⚠️ Cấp Full Disk Access (CRITICAL — root cause của setup fail lần đầu)

Project nằm ở `~/Documents/` → bị macOS TCC chặn launchd context. Phải cấp FDA cho **CẢ HAI** binary:

1. Mở: `open "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Privacy_AllFiles"`
2. Bấm **"+"** (unlock 🔒 nếu cần)
3. `Cmd + Shift + G` → gõ `/bin/bash` → **Go** → **Open** → bật toggle
4. Lặp lại với `/opt/homebrew/bin/node`

**Tại sao cần cả 2:**
- `bash` đọc + exec wrapper script trong `~/Documents/`
- `bash` exec → `node` → `node` gọi `process.cwd()` cũng cần FDA, không kế thừa từ bash

**Khi nào cần cấp lại:**
- Sau khi macOS reset TCC database (hiếm, vd sau major version upgrade)
- KHÔNG cần cấp lại sau `brew upgrade node` — symlink path không đổi

**Triệu chứng nếu thiếu FDA:**
- Thiếu cho `bash` → log: `/bin/bash: ...start-dev-daemon.sh: Operation not permitted` (exit 126)
- Thiếu cho `node` → log: `Error: EPERM: process.cwd failed ... uv_cwd` (exit 7)

### 3. Cài LaunchAgent

```bash
cd /Users/dominium/Documents/Project/SMIT-OS
npm run daemon:install
```

Script sẽ:
- Bootout instance cũ (nếu có) — silent fail OK
- Copy `scripts/com.smitos.dev.plist` → `~/Library/LaunchAgents/`
- Bootstrap qua `launchctl bootstrap gui/$(id -u)`

### 4. Verify

```bash
npm run daemon:status      # phải thấy state = running, pid > 0
sleep 3
curl -sI http://localhost:3000 | head -1   # HTTP/1.1 200 (hoặc 302/304)
```

### 5. Test reboot (optional)

Reboot Mac Mini → login → đợi 1-2 phút → mở browser `http://localhost:3000` hoặc `https://qdashboard.smitbox.com` → phải lên ngay.

Xem log timeline:
```bash
cat ~/Library/Logs/smit-os-dev.out.log | tail -30
```

---

## Troubleshooting

### Daemon load nhưng server không lên

```bash
npm run daemon:logs
```

Các trường hợp thường gặp:

| Triệu chứng trong log | Nguyên nhân | Fix |
|----------------------|-------------|-----|
| `Operation not permitted` (exit 126) | Thiếu FDA cho `/bin/bash` | Xem mục **Setup Mới Từ Đầu → Bước 2** |
| `EPERM: process.cwd failed ... uv_cwd` (exit 7) | Thiếu FDA cho `/opt/homebrew/bin/node` | Xem mục **Setup Mới Từ Đầu → Bước 2** |
| `DB not ready after 300s. Exiting` | Docker Desktop chưa mở | Mở Docker Desktop, đợi container up, daemon tự retry sau 30s |
| `Node: NOT FOUND` | PATH sai (Node không phải Homebrew?) | Sửa `EnvironmentVariables.PATH` trong plist + `daemon:install` lại |
| `EADDRINUSE :::3000` | Port 3000 đang bị process khác chiếm | `lsof -i :3000` → kill process hoặc đổi PORT |
| Liên tục restart, throttle warnings | Crash loop | `npm run daemon:logs` xem stack trace. ThrottleInterval=30s nên không spam quá |

### Race condition khi mới reboot

Plan nay đã handle: wrapper script đợi DB tối đa 5 phút trước khi cho launchd retry. Nếu user mở Docker Desktop chậm > 5 phút:
- Daemon exit 1
- launchd đợi 30s (ThrottleInterval) rồi spawn lại
- Cứ lặp đến khi DB up

### Manually stop daemon (debug, xài port khác, v.v.)

```bash
launchctl bootout gui/$(id -u)/com.smitos.dev
```

Daemon sẽ KHÔNG tự restart vì exit code 0 (KeepAlive.SuccessfulExit=false). Bật lại bằng:

```bash
npm run daemon:restart   # nếu plist vẫn còn trong ~/Library/LaunchAgents/
# hoặc full reinstall
npm run daemon:install
```

### Sau khi sửa plist hoặc wrapper script

```bash
# Sửa script: chỉ cần restart
npm run daemon:restart

# Sửa plist: cần install lại
npm run daemon:install
```

### Xoá hoàn toàn (rollback)

```bash
npm run daemon:uninstall
```

Sau đó dev server sẽ lại cần `npm run dev` thủ công như trước.

---

## Plist Configuration Notes

Key choices trong `scripts/com.smitos.dev.plist`:

- `KeepAlive.SuccessfulExit=false` — restart **chỉ khi** crash (exit ≠ 0). Manual `bootout` exit clean nên không spawn lại. Đây là contract giữa user intent (stop = stop) và auto-recovery (crash = recover).
- `ThrottleInterval=30` — launchd đợi tối thiểu 30s giữa các spawn. Tránh log spam nếu DB không bao giờ up.
- `RunAtLoad=true` — chạy ngay khi LaunchAgent load (cả khi `bootstrap` lẫn khi login).
- `EnvironmentVariables.PATH` — launchd context không có user shell PATH. Phải khai báo `/opt/homebrew/bin` cho `node`/`npm`/`tsx`.

---

## Liên Quan

- `docs/cloudflare-tunnel-setup.md` — Tunnel daemon (system-level, đã setup sẵn)
- `CLAUDE.md` — Tổng quan dev workflow
- `docker-compose.yml` — DB container có `restart: always`
