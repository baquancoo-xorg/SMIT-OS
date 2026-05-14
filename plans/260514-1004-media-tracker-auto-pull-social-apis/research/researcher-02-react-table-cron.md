# Media Tracker Rewrite: React Table, Cron, Encryption Research

**Scope:** TanStack Table v8 sorting/filtering/grouping, node-cron in tsx watch, Prisma AES-256-GCM, refresh UX, MediaFormat icons.

**Current state:** Existing `media-posts-table.tsx` uses custom `useSortableData` hook + TableShell (simple sort, no multi-column, no group-by). Rows ~50 today, may scale to 5000+.

---

## 1. TanStack Table v8 vs Current useSortableData

**Current approach:** Lightweight, single-column sort via custom hook accessor pattern.
**TanStack Table (headless):** State management for multi-sort, column filtering, global search, grouping. Requires manual markup.

### Findings
- **Multi-sort capability:** Can sort by 2+ columns simultaneously (sortingState = array). Current code supports single key only.
- **Filtering:** Column + global filters separate; column filters per accessor, global scans all columns. Current code has no filters.
- **Virtualization:** TanStack Table itself is headless—virtualization via `react-virtual` or `@tanstack/react-virtual` (sibling package). Not built-in.
- **Client-side scale:** Multi-filter + sort on 5000 rows feasible if memoized properly; pagination/virtualization recommended above 1000 rows.
- **Performance memo:** Use `useMemo` for columns, data, and sorting state to prevent unnecessary recalculations.

### Trade-offs
| Approach | Complexity | Features | Scale |
|----------|-----------|----------|-------|
| Keep `useSortableData` | 1/5 | Single sort only | <200 rows |
| Upgrade to TanStack Table | 3/5 | Multi-sort, filter, group, pagination | 1000–5000 rows (with virtualization) |
| Server-side filtering | 4/5 | Unlimited scale, UI latency | 10k+ rows |

**Recommendation:** Upgrade to TanStack Table v8 + `@tanstack/react-virtual` for 5000-row future-proofing. Current 50 rows tolerates either; migration now avoids later refactor.

Sources:
- [TanStack Table v8 Column Filtering](https://tanstack.com/table/v8/docs/guide/column-filtering)
- [TanStack Table v8 Sorting](https://tanstack.com/table/v8/docs/guide/sorting)
- [TanStack Table v8 Virtualization](https://tanstack.com/table/v8/docs/guide/virtualization)

---

## 2. Group-by UX Patterns (Sticky Headers, Collapse/Expand)

### Findings
- **Notion/Airtable pattern:** Group rows by a column (e.g., channel, format, date), show sticky group header with aggregate (sum, count, avg). Collapse all/expand all buttons.
- **Modern dashboards:** Standard grid layout + card-based data organization. Groups function as "sections."
- **Sticky header:** Maintain group header during scroll. CSS `position: sticky; top: X` or JS calculation if virtualized.
- **Collapse state:** Store per-group or global; toggle via click on group header. React state or URL param (shareable).

### SMIT-OS Scale Considerations
- <10k rows: Client-side grouping via `useMemo` on raw data → group by field → render groups with toggle state.
- No sticky-header gotchas if rows < 1000 (minimal scroll depth).
- Aggregate calc: Quick (summing reach/engagement on 50 rows is instant).

### Implementation sketch
```
Data → Group by channel (or format/date)
  → StickyGroupHeader (channel name + sum reach, count posts)
    → Expandable row list
  → Toggle collapse state via context/local state
```

**Recommendation:** Use custom TanStack Table grouping via `getGroupedRowModel()` if upgrading table. Otherwise, implement via `useMemo` grouping + React state toggle for collapse. Sticky header via CSS for non-virtual, JS observer for virtual.

Sources:
- [Notion Dashboards Help](https://www.notion.com/help/dashboards)
- [Dashboard UX Patterns (Pencil & Paper)](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)

---

## 3. node-cron in tsx Watch: Duplicate Firing & Graceful Shutdown

### Findings
- **Hot-reload duplicate issue:** When `tsx watch` restarts the process, node-cron jobs are re-registered, firing duplicate schedules. Known issue #393 on node-cron repo.
- **Idempotency key pattern:** Assign unique job ID to each cron instance; check if job already running before firing. Prevents double-execution but doesn't prevent duplicate registration.
- **Graceful shutdown:** Listen to SIGTERM → stop accepting new jobs → wait for in-flight jobs (timeout 30s) → close DB/connections → exit. node-schedule (not node-cron) has native support; node-cron requires manual setup.

### SMIT-OS Specific
- Dev: `tsx watch` restarts on file change. Cron jobs re-register on each restart. Solution: Check global state (`global.__cron_jobs?`) and skip re-registration if already running.
- Prod: PM2 or systemd + SIGTERM listener. Implement graceful shutdown handler.
- Scope: 1–3 jobs (poll TikTok/Insta/LinkedIn). Duplicate firing = re-fetch same data; idempotent if INSERT OR IGNORE in DB.

### Mitigation Options
| Pattern | Effort | Risk | Scale |
|---------|--------|------|-------|
| Global registry check (`global.__jobs`) | 1/5 | Low (dev-only) | Any |
| Use Bree (pure JS scheduler) | 3/5 | Medium (new dep) | Small jobs |
| Use Agenda (MongoDB job queue) | 4/5 | High (add service) | Enterprise |
| Idempotency keys in job logic | 2/5 | Low (app-level) | Any |

**Recommendation:** Use global registry check for dev (`if (!global.__social_cron_registered)`) + manual SIGTERM listener for prod. Idempotency (INSERT OR IGNORE) in social API pull logic. Defer Bree/Agenda unless job count > 10 or needs persistence across restarts.

Sources:
- [node-cron duplicate jobs issue](https://github.com/node-cron/node-cron/issues/393)
- [Digital Ocean node-cron guide](https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples)
- [DEV: Cron vs Real Task Schedulers](https://dev.to/elvissautet/cron-jobs-vs-real-task-schedulers-a-love-story-1fka)

---

## 4. Prisma AES-256-GCM for SocialChannel.accessToken

### Findings
- **prisma-field-encryption package:** Middleware-based encryption; uses `fieldEncryptionMiddleware()` to auto-encrypt/decrypt marked fields.
- **Schema annotation:** Add `/// @encrypted` comment to fields. Prisma client handles transparent encryption/decryption.
- **Key format:** Base64-encoded; stored in env var `PRISMA_FIELD_ENCRYPTION_KEY`. Example: `k1.aesgcm256.DbQoar8ZLuUsOHZNyrnjlskInHDYlzF3q6y1KGM7DUM=`.
- **Non-deterministic:** Each encryption yields different ciphertext (random IV). Indexes cannot be placed on encrypted fields.
- **Reuse SMIT-OS pattern:** Project already uses AES-256-GCM for TOTP (check `src/server/lib/totp-encryption.ts`). Use same key/util or prisma-field-encryption middleware.

### Two Approaches
1. **Existing util reuse:** Encrypt/decrypt token in resolver/hook using existing cipher. Manual on read/write.
2. **Prisma middleware:** Automatic via `prisma-field-encryption`. Cleaner but adds dep; ensure version aligns with Prisma (v5+).

### SMIT-OS Fit
- SocialChannel.accessToken is per-user secret. Must not log or expose in API.
- If using prisma-field-encryption: Mark field `accessToken String /// @encrypted`, apply middleware at Prisma client init.
- If using existing util: Add encrypt/decrypt hooks in SocialChannel create/read resolvers.

**Recommendation:** Use `prisma-field-encryption` middleware for consistency + automatic decryption on queries. Reduces manual boilerplate. Verify Prisma v5+ (project uses Prisma 5.x). Set env var in `.env.local` (never commit).

Sources:
- [prisma-field-encryption npm](https://www.npmjs.com/package/prisma-field-encryption/v/1.0.0)
- [prisma-field-encryption GitHub](https://github.com/47ng/prisma-field-encryption)
- [Prisma Encrypted Fields Discussion](https://github.com/prisma/prisma/discussions/8107)

---

## 5. Refresh Button UX: Loading State + Toast Feedback

### Findings
- **useMutation + isLoading:** TanStack Query v5 mutation provides `isPending` (v5; was `isLoading` in v4), `error`, `variables`. Render spinner on button while `isPending`.
- **Optimistic updates:** Use `onMutate` to update cache before fetch, rollback on error via `onError`. No loading state needed—UI shows result immediately.
- **Toast notifications:** React-Toastify or shadcn/sonner (headless). Show summary: "Fetched 3 new posts, 1 error (TikTok timeout)". Include retry button on error.
- **Rollback on failure:** TanStack Query automatically reverts cache on mutation error if using onMutate + onError rollback.

### Pattern for Media Tracker
```
"Refresh" button → isPending spinner
  → onMutate: optimistic update (show spinner, disable button)
  → onSuccess: toast "Fetched {count} posts"
  → onError: toast "Error: {reason}" + retry button
```

### Variables Structure
- `{ fetched: 3, errors: [{ platform: 'tiktok', reason: 'timeout' }] }`
- Toast renders count + failed platforms.

**Recommendation:** Use TanStack Query v5 `useMutation` + shadcn/sonner toast. No optimistic update needed (data fetch is idempotent). Show loading spinner + toast on completion (success or error with details).

Sources:
- [TanStack Query v5 Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [TanStack Query v5 Optimistic Updates UI Example](https://tanstack.com/query/v5/docs/framework/react/examples/optimistic-updates-ui)
- [Medium: TanStack Query v5 Optimistic Updates](https://medium.com/@stojanovic.nemanja71/optimistic-updates-in-tanstack-query-v5-dfbcbb124113)

---

## 6. MediaFormat Icons (Lucide React)

### Findings
- **Lucide v1.14+:** 1600+ icons, tree-shakable, fully typed, customizable (size, color, strokeWidth).
- **Media icons:** `Photo`, `Video`, `Reel` (⚠ check if exists; may be `Film` or `Clapperboard`), `Album`, `Link`, `Calendar`/`Event`.
- **Search strategy:** lucide.dev/icons → filter "media" or browse library. Icon naming is lowercase kebab-case in components.

### Mapping for SMIT-OS
- **STATUS** → `CheckCircle` (success), `AlertCircle` (pending), `XCircle` (error)
- **PHOTO** → `Image` or `Photo`
- **VIDEO** → `Video`
- **REEL** → `Clapperboard` or `Film` (no "Reel" in Lucide)
- **ALBUM** → `ImageGallery` or `Layers`
- **LINK** → `Link` or `ExternalLink`
- **EVENT** → `Calendar` or `Clock`

### Usage
```tsx
import { Photo, Video, Clapperboard } from 'lucide-react';

<Photo size={20} className="text-primary" />
```

**Recommendation:** Map media formats to Lucide icons above. Use `size={20}` for table icons, `size={24}` for cards. Color via Tailwind class (e.g., `text-primary`). Test availability on lucide.dev/icons before committing (Reel may need fallback to Clapperboard).

Sources:
- [Lucide React Guide](https://lucide.dev/guide/react)
- [Lucide Icons Gallery](https://lucide.dev/icons/)
- [lucide-react npm](https://www.npmjs.com/package/lucide-react)

---

## Recommendations (Ranked)

1. **TanStack Table v8 + react-virtual** — Upgrade for multi-sort, filtering, grouping capability. Defer virtualization until >1000 rows.
2. **Global cron registry check** — Prevent duplicate node-cron firing in tsx watch dev environment.
3. **prisma-field-encryption middleware** — Encrypt SocialChannel.accessToken transparently. Automatic on all queries.
4. **TanStack Query useMutation + sonner toast** — Refresh button with loading spinner, success/error toast showing `{fetched, errors}`.
5. **Group-by via useMemo + TanStack grouping** — Implement sticky group header for channel/format grouping. Use CSS sticky for non-virtual rows.
6. **Lucide media icons** — Map formats to lucide.dev icons (Photo, Video, Clapperboard, etc.). Size 20–24px, Tailwind color classes.

---

## Unresolved Questions

1. **Reel icon**: Does Lucide have native "Reel" icon? If not, confirm fallback (Clapperboard vs Film).
2. **Group-by sorting**: When grouped, should groups sort by aggregate (sum reach) or by group name? Product spec needed.
3. **Existing totp-encryption.ts**: Where is it? Can SocialChannel.accessToken reuse same cipher or force prisma-field-encryption?
4. **Social API pull scope**: Which platforms (TikTok, Instagram, LinkedIn, YouTube)? Scope determines job count + schedule.
