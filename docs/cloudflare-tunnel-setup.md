# Cloudflare Tunnel Setup — SMIT-OS

Domain: `qdashboard.smitbox.com` → `localhost:3000` (Mac mini local dev server).

## Architecture

```
[external user]
      │ HTTPS
      ▼
qdashboard.smitbox.com (CF DNS CNAME)
      │
      ▼
   CF edge
      │ tunnel
      ▼
[Mac mini] cloudflared daemon (launchd: com.cloudflare.cloudflared)
      │ HTTP forward
      ▼
localhost:3000 (Express via npm run dev)
```

## Prerequisites

- macOS với sudo access
- Cloudflare Dashboard access (Zero Trust)
- Domain `smitbox.com` managed bởi Cloudflare DNS

## Initial Setup (1 lần)

### 1. Install cloudflared binary

```bash
brew install cloudflare/cloudflare/cloudflared
cloudflared --version
```

### 2. Tạo tunnel + token (CF Dashboard)

1. CF Dashboard → **Zero Trust → Networks → Tunnels → Create a tunnel**
2. Connector type: **Cloudflared**
3. Name: `smit-os-prod`
4. **Copy token ngay** (chỉ show 1 lần) → save vào `~/.config/cloudflared-token.txt`:
   ```bash
   mkdir -p ~/.config
   echo "<TOKEN>" > ~/.config/cloudflared-token.txt
   chmod 600 ~/.config/cloudflared-token.txt
   ```
5. **Public Hostnames** tab → Add:
   - Subdomain: `qdashboard`
   - Domain: `smitbox.com`
   - Service: `http://localhost:3000`

### 3. Install service

```bash
sudo cloudflared service install <TOKEN>
```

Lệnh này tạo launchd plist tại `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist` và bootstrap daemon ngay.

### 4. Verify

```bash
sudo launchctl list | grep cloudflare      # PID > 0
curl -I https://qdashboard.smitbox.com     # 200/3xx (cần app :3000 chạy)
```

## NPM Scripts (daily ops)

| Command | Purpose |
|---|---|
| `npm run tunnel:status` | Show daemon PID |
| `npm run tunnel:restart` | Kickstart daemon |
| `npm run tunnel:logs` | Stream live logs |
| `npm run tunnel:stop` | Stop daemon |
| `npm run tunnel:start` | Start daemon (sau khi stop) |

## Troubleshooting

### 502 Bad Gateway
App `:3000` không chạy. Fix: `npm run dev`.

### 521 / 1033 Tunnel error
Daemon down hoặc disconnected. Fix:
1. `npm run tunnel:status` → check PID
2. Nếu down: `npm run tunnel:start`
3. Nếu up nhưng vẫn fail: `npm run tunnel:restart`, đợi 30s

### Sau Mac reboot domain không lên
Daemon should auto-start. Check:
```bash
sudo launchctl list | grep cloudflare
ls /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
```
Nếu plist missing → re-run "Initial Setup" §3.

### Sau network change (đổi WiFi)
Tunnel sẽ tự reconnect trong 30-60s. Nếu > 2 phút:
```bash
npm run tunnel:restart
```

### Full reset (nuclear option)
```bash
sudo cloudflared service uninstall
# Lấy token mới từ CF Dashboard (delete tunnel cũ → create mới)
sudo cloudflared service install <NEW_TOKEN>
```

## Security

- **Token = secret.** KHÔNG commit, KHÔNG paste vào chat/Slack/screenshot share
- Lưu token: `~/.config/cloudflared-token.txt` chmod 600 hoặc password manager
- Khi nghi token leak: rotate ngay (delete tunnel CF Dashboard → tạo mới)
- Plist `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist` chứa token raw → file root-only theo default, OK

## References

- Plan: `plans/260508-1500-cloudflare-tunnel-persistence/`
- Brainstorm: `plans/reports/brainstorm-260508-1500-cloudflare-tunnel-persistence.md`
- CF docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/

---

_Last updated: 2026-05-08_
