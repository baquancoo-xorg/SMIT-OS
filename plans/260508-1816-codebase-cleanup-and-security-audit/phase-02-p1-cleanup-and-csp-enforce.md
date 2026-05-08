# Phase 2 — P1 Cleanup + CSP Enforce

## Context Links

- Parent plan: [`plan.md`](./plan.md)
- Source: brainstorm § P1-1 → P1-5
- Prerequisite: Phase 1 hoàn thành stable ≥ 1h

## Overview

- **Date:** 2026-05-08
- **Priority:** 🟠 P1 (trong tuần)
- **Effort:** ~3h
- **Status:** pending
- **Description:** Fix 3 npm CVE moderate, remove unused deps, cleanup 71 worktrees rác (205MB), xoá legacy logs/files, switch CSP từ report → enforce ở production.

## Key Insights

- 71 git worktrees ở `.claude/worktrees/agent-*` đều `locked` → di sản từ session Claude trước. Cần unlock + remove để tránh lỗi `git worktree`.
- `@google/genai` (1.49.0) và `posthog-node` (5.33.3) declared trong `package.json` nhưng zero imports → bloat node_modules + supply chain surface.
- CSP hiện ở `reportOnly: true` → XSS payload vẫn execute. Switch enforce phải verify Material Symbols, Google Fonts, Vite dev runtime không bị block.
- `npm audit fix` an toàn cho 3 CVE này (chỉ minor bumps).

## Requirements

### Functional
- `npm audit` return 0 moderate+ CVE.
- `package.json` không còn `@google/genai`, `posthog-node`.
- `.claude/worktrees/` empty hoặc chỉ giữ active worktrees (nếu có).
- Production CSP enforce mode (block XSS).

### Non-functional
- Disk usage giảm ≥ 200MB sau worktree cleanup.
- Build production (`npm run build`) success.
- Frontend pages render đúng (Material Symbols, Google Fonts load OK).

## Architecture

Không thay đổi runtime architecture. Tác động ở build-time + ops layer.

```
[before]                    [after]
deps: 36                    deps: 34 (-2 unused)
audit: 3 mod                audit: 0
.claude/worktrees: 205MB    .claude/worktrees: ~0
CSP: report-only            CSP: enforce (prod only)
```

## Related Code Files

**Modify:**
- `server.ts` (line ~78): Helmet CSP config
- `package.json` + `package-lock.json`: dep updates

**Delete:**
- `.claude/worktrees/agent-*` (71 dirs)
- `logs/launchagent.log`, `logs/launchagent-error.log`, `logs/startup.log`
- `prisma/dev.db`
- `metadata.json`

**Read for context:**
- `index.html` — verify external font loads
- `src/index.css` — verify không có inline-style violations
- Vite config

## Implementation Steps

### Step 1: NPM audit fix (15 min)
```bash
npm audit                          # baseline
npm audit fix                      # auto-fix
npm audit                          # verify 0 moderate+
npm run typecheck                  # verify no break
npm run build                      # verify build OK
```

Manual bump nếu auto fail:
```bash
npm install express-rate-limit@^8.5.1 postcss@^8.5.10
```

### Step 2: Remove unused deps (5 min)
```bash
# Verify zero imports
grep -rln "@google/genai\|posthog-node" server/ src/ scripts/ server.ts
# Expect: empty

npm uninstall @google/genai posthog-node
npm run typecheck
```

### Step 3: Cleanup git worktrees (20 min)
```bash
# Pre-check: verify không có WIP nào chưa merge
git worktree list | tail -71 | awk '{print $1, $2}'
git worktree list | grep "agent-" | awk '{print $1}' > /tmp/worktree-paths.txt
wc -l /tmp/worktree-paths.txt   # confirm 71

# Unlock + remove tất cả agent worktrees
while read -r p; do
  git worktree unlock "$p" 2>/dev/null
  git worktree remove --force "$p" 2>/dev/null
done < /tmp/worktree-paths.txt

# Force remove leftover dirs
rm -rf .claude/worktrees/agent-*

# Prune
git worktree prune
git worktree list                 # verify chỉ còn main + active worktrees
du -sh .claude/worktrees/         # verify giảm
```

### Step 4: Delete legacy files (5 min)
```bash
rm -f logs/launchagent.log logs/launchagent-error.log logs/startup.log
rm -f prisma/dev.db
rm -f metadata.json

# Verify gitignore handles these (already does)
git status                        # expect clean
```

### Step 5: CSP enforce switch (1.5h — riskiest step)

5a. **Audit current CSP violations:**
```bash
# Run dev server
npm run dev &
sleep 3

# Open browser console, navigate qua các pages chính:
# - /login
# - /dashboard/overview
# - /lead-tracker
# - /okrs
# - /settings
# Watch console cho CSP violation reports
```

5b. **Identify required directives:**
- `fonts.googleapis.com` (CSS), `fonts.gstatic.com` (font files)
- `picsum.photos` (avatar placeholders — verify `setup-db.ts:36`)
- Material Symbols inline icons
- Vite HMR websocket (dev only) — `ws://localhost:*`

5c. **Modify `server.ts`:**
```ts
// Replace existing helmet block
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"], // Vite dev needs inline; review prod tighten
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'https://picsum.photos'],
      'connect-src': ["'self'", ...(process.env.NODE_ENV !== 'production' ? ['ws://localhost:*', 'http://localhost:*'] : [])],
    },
    reportOnly: process.env.NODE_ENV !== 'production',
  },
}));
```

5d. **Test prod build local:**
```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start &
sleep 3
curl -I http://localhost:3000/        # check Content-Security-Policy header (no -Report-Only suffix)
# Open browser, smoke test login + dashboard
```

5e. **Iterate cho tới khi 0 violations.**

### Step 6: Verify (10 min)
```bash
npm run typecheck
npm run lint                      # tsc --noEmit
npm audit                         # 0 moderate+
du -sh .claude/worktrees/         # ~0
ls logs/                          # only dev-server.log
```

### Step 7: Commit (5 min)
```bash
git add -A
git commit -m "chore: P1 cleanup — fix CVE, remove unused deps, cleanup worktrees, enforce CSP prod"
```

## Todo List

- [ ] `npm audit fix` + verify 0 moderate+
- [ ] `npm uninstall @google/genai posthog-node`
- [ ] Pre-check worktrees không có WIP
- [ ] Remove 71 agent worktrees + prune
- [ ] Delete 3 legacy log files
- [ ] Delete `prisma/dev.db`, `metadata.json`
- [ ] Audit CSP violations dev mode
- [ ] Update `server.ts` CSP config với explicit directives
- [ ] Test prod build local + smoke test
- [ ] `npm run typecheck` pass
- [ ] Commit + push

## Success Criteria

- ✅ `npm audit --audit-level=moderate` exit code 0
- ✅ `grep "@google/genai\|posthog-node" package.json` empty
- ✅ `git worktree list | wc -l` ≤ 2 (main + maybe 1 active)
- ✅ `du -sh .claude/worktrees/` ≤ 5MB
- ✅ Production response header `Content-Security-Policy:` (no `-Report-Only`)
- ✅ Frontend smoke test pages load OK
- ✅ `npm run typecheck` pass
- ✅ `npm run build` success

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `npm audit fix` break runtime | Low | Medium | `npm install <pkg>@<minor>` thay vì major bump |
| Worktree force-remove mất WIP | Low | High | Pre-check git status mỗi worktree |
| CSP enforce block legit Google Fonts | High | Medium | Test prod build local trước deploy |
| CSP enforce block Vite HMR ở dev | Low | Low | Keep reportOnly ở dev mode |
| `posthog-node` thực ra dùng ở runtime | Very Low | Medium | Pre-check verified zero imports |

## Security Considerations

- CSP enforce là defense-in-depth → giảm impact của XSS nếu rò.
- Worktrees chứa branch lịch sử — verify không leak credentials trong commit history trước remove.
- Audit fix có thể introduce new dep versions — review changelog trước upgrade major.

## Rollback Strategy

```bash
git checkout HEAD~1 package.json package-lock.json
npm install
git checkout HEAD~1 server.ts
# Worktrees đã xoá không rollback được — commit history của chúng vẫn ở git refs
```

## Next Steps

→ Phase 3: P2 Sprint Refactor sau khi Phase 2 stable ≥ 1 ngày.
