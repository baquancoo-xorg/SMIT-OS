# Cloudflare Tunnel Setup

Tunnel route: `qdashboard.smitbox.com` → `http://localhost:3000`

Tunnel chạy qua launchd daemon `com.cloudflare.cloudflared`, RunAtLoad + KeepAlive (auto-start on boot, auto-restart on crash).

---

## Architecture

```
Browser → Cloudflare Edge → Tunnel (HKG) → Mac Mini → cloudflared (root) → localhost:3000 → app
```

- **Mode:** Remote-managed (token-based). Toàn bộ ingress config nằm trên Cloudflare Dashboard, local chỉ chạy connector.
- **Binary:** `/opt/homebrew/bin/cloudflared` (Homebrew)
- **Plist:** `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist` (root, `-rw-r--r--`)
- **Logs:** `/Library/Logs/com.cloudflare.cloudflared.{out,err}.log`
- **Metrics:** `http://127.0.0.1:20241/metrics`

---

## Quick Commands

```bash
npm run tunnel:status    # Check daemon load state
npm run tunnel:restart   # Kickstart daemon (sau network change)
npm run tunnel:logs      # Stream logs qua macOS log
npm run tunnel:stop      # Bootout daemon
npm run tunnel:start     # Bootstrap daemon
```

---

## Setup Mới Từ Đầu

### 1. Tạo tunnel trên Cloudflare Dashboard

1. https://one.dash.cloudflare.com/ → **Networks → Tunnels** → **Create a tunnel**
2. Type: **Cloudflared** → đặt tên (vd `quan-dashboard`)
3. Copy **token** dạng `eyJhIjoi…` từ màn hình "Install and run a connector"
4. Tab **Public Hostnames** (HOẶC Hostname routes Beta — KHÔNG dùng "Published application routes")
   - Subdomain: `qdashboard`
   - Domain: `smitbox.com`
   - Service: `HTTP` → `localhost:3000`
   - Save → CF tự tạo CNAME DNS record

### 2. Cài cloudflared trên Mac Mini

```bash
brew install cloudflared
```

### 3. Tạo plist daemon

Tạo file `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist` (cần sudo):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.cloudflare.cloudflared</string>
    <key>ProgramArguments</key>
    <array>
      <string>/opt/homebrew/bin/cloudflared</string>
      <string>tunnel</string>
      <string>run</string>
      <string>--token</string>
      <string>YOUR_TUNNEL_TOKEN_HERE</string>
    </array>
    <key>RunAtLoad</key><true/>
    <key>StandardOutPath</key><string>/Library/Logs/com.cloudflare.cloudflared.out.log</string>
    <key>StandardErrorPath</key><string>/Library/Logs/com.cloudflare.cloudflared.err.log</string>
    <key>KeepAlive</key>
    <dict><key>SuccessfulExit</key><false/></dict>
    <key>ThrottleInterval</key><integer>5</integer>
  </dict>
</plist>
```

```bash
sudo chown root:wheel /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo chmod 644 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```

### 4. Verify

```bash
sleep 10
curl -sS -o /dev/null -w "%{http_code}\n" https://qdashboard.smitbox.com/
# Expect: 200
```

---

## Troubleshooting

### Domain trả 502

Theo thứ tự:

1. **App `:3000` đang chạy?**
   ```bash
   curl http://localhost:3000/  # phải 200
   ```
   Nếu fail → `npm run dev`

2. **Tunnel daemon đang chạy?**
   ```bash
   pgrep -fl cloudflared        # phải có process
   npm run tunnel:status         # phải thấy entry
   ```
   Nếu fail → `npm run tunnel:restart`

3. **Tunnel có nhận request không?**
   ```bash
   curl -sS http://127.0.0.1:20241/metrics | grep cloudflared_tunnel_total_requests
   ```
   - Counter `> 0` và tăng khi bạn refresh domain → tunnel OK, vấn đề có thể ở app
   - Counter `= 0` → CF edge KHÔNG forward request tới tunnel → vấn đề ở Dashboard:
     - Public Hostname mapping bị mất
     - DNS record `qdashboard` không phải CNAME tới `<tunnel-id>.cfargotunnel.com`
     - Có nhiều connector trên cùng tunnel (load-balance fail)

4. **Multiple connectors gây load-balance fail**

   Vào Dashboard → Tunnel → Connectors. Nếu có > 1 connector:
   - Connector cũ ở máy khác → đến máy đó chạy `sudo launchctl bootout system/com.cloudflare.cloudflared`
   - Hoặc xóa connector qua API (cần API token)

### DNS sai loại record

Triệu chứng: `dig qdashboard.smitbox.com` trả A record `104.21.x.x` mà tunnel `total_requests = 0`.

Fix: Vào Dashboard → tunnel → Public Hostnames → Edit hostname → Save lại để CF tự rewrite CNAME.

### Token rotation

Token plain text trong plist + `ps` output → bất kỳ user/process trên máy đều đọc được. Khi nghi ngờ leak:

1. Dashboard → Tunnel → Refresh token
2. Update token mới vào plist
3. `npm run tunnel:restart`

---

## Network Change

Khi máy chuyển mạng (mang đi-về), tunnel reconnect tự động qua KeepAlive. Nếu reconnect fail kéo dài, restart thủ công:

```bash
npm run tunnel:restart
```

---

## Cleanup Hoàn Toàn

Khi cần nuke tunnel local:

```bash
sudo launchctl bootout system/com.cloudflare.cloudflared 2>/dev/null
sudo rm -f /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo rm -f /Library/Logs/com.cloudflare.cloudflared.*.log
brew uninstall cloudflared
```

Trên Dashboard: Networks → Tunnels → Delete tunnel.
