# Phase 04 — smitos-mcp-server scaffold + libs

## Context Links

- Parent plan: [../plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260512-0045-mcp-cowork-smitos-data-access.md` (sections "Repo structure", "Tool pattern")
- MCP SDK docs: [modelcontextprotocol.io](https://modelcontextprotocol.io) (TypeScript SDK)
- **Depends on:** phase 01 (server has middleware), but technically isolated — can develop in parallel after phase 01 contract frozen. Tests need phase 03 (whitelisted endpoints).
- **Blocks:** phase 05, 06

## Overview

- Date: 2026-05-12
- Description: Initialize `smitos-mcp-server` repo at `/Users/dominium/Documents/Project/smitos-mcp-server`, install deps (pin SDK minor), create reusable `lib/*` modules (env, api-client, format, tool-registry), wire stdio MCP server entrypoint.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights

- Repo lives OUTSIDE SMIT-OS — separate git history, separate `package.json`, separate deploy lifecycle. This phase does not modify SMIT-OS at all.
- `@modelcontextprotocol/sdk` minor pin (e.g. `~0.6.0`) — Anthropic still iterating; minor changes can break server registration.
- Tool registry via filesystem glob keeps tool authoring zero-boilerplate (drop a file, it auto-registers). Trade-off: dynamic imports are async, must `await Promise.all` before `server.start()`.
- `zod` for input schemas — MCP SDK's `inputSchema` expects JSON Schema. Use `zod-to-json-schema` adapter OR write JSON Schema directly. Recommend: keep zod for runtime validation, generate JSON Schema once per tool via adapter at registration time.
- `axios` instance shared across tools — pin `X-API-Key` header at instance level, never per-call. Retry logic: 2 attempts, exponential 500ms→1500ms backoff on network/5xx only (not 4xx — those are auth/scope errors that retrying won't fix).

## Requirements

### Functional

- New repo `smitos-mcp-server` initialized: `git init`, `npm init -y`.
- `package.json` deps: `@modelcontextprotocol/sdk` (pin minor), `axios`, `zod`, `zod-to-json-schema`, `dotenv`. Dev: `typescript`, `tsx`, `@types/node`.
- `tsconfig.json`: target ES2022, module nodenext, moduleResolution nodenext, strict, outDir `dist`, rootDir `src`.
- `src/lib/env.ts` — loads `.env` via dotenv, validates with zod (`SMITOS_API_URL`, `SMITOS_API_KEY`), throws descriptive error if missing.
- `src/lib/api-client.ts` — axios instance with baseURL = `SMITOS_API_URL`, header `X-API-Key`, 10s timeout, response interceptor for retry (2x, exponential backoff on 5xx/network), error mapper → `SmitosApiError` class with `status`, `userMessage`.
- `src/lib/format.ts` — pure functions:
  - `formatTable(rows: Record<string, unknown>[], columns: string[])` → Markdown table string
  - `formatJson(obj)` → fenced code block
  - `formatError(err)` → user-friendly MCP content block
  - All return shape `{ content: [{ type: 'text', text: string }] }`
- `src/lib/tool-registry.ts` — function `loadTools(): Promise<ToolDefinition[]>`:
  - Recursively glob `src/tools/**/*.ts`
  - Dynamic-import each, expect default export `{ name, description, inputSchema (zod), handler }`
  - Validate shape (zod meta-schema); skip + log warning on invalid
  - Return array
- `src/index.ts` — entry:
  - Validate env
  - Create MCP `Server` instance + stdio transport
  - `await loadTools()` → register each via `server.tool(name, description, jsonSchema, handler)`
  - Connect transport, handle SIGTERM/SIGINT (close gracefully)
- `package.json` scripts: `build` (`tsc`), `dev` (`tsx src/index.ts`), `start` (`node dist/index.js`), `typecheck` (`tsc --noEmit`), `lint` = typecheck alias.
- `.env.example` with documented vars.
- `README.md` skeleton: install / configure / Claude Desktop snippet placeholder (filled in phase 07).

### Non-functional

- Each lib file < 200 LOC (targets: env 30, api-client 80, format 80, tool-registry 80, index 60).
- Stdio transport — no HTTP server, no exposed port.
- Cold start < 1s (Claude Desktop spawns process on session start).

## Architecture

### Directory layout (target end-of-phase-04)

```
/Users/dominium/Documents/Project/smitos-mcp-server/
├── .env.example
├── .gitignore
├── .npmrc                  (optional: save-exact for SDK)
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts                          (entry)
    ├── lib/
    │   ├── env.ts
    │   ├── api-client.ts
    │   ├── format.ts
    │   └── tool-registry.ts
    └── tools/                            (empty; populated phase 05/06)
        └── .gitkeep
```

### Tool contract (frozen here, consumed by phase 05/06)

```ts
// src/lib/tool-types.ts (small types module, < 30 LOC)
import type { z } from 'zod';
export interface ToolDefinition<TInput = unknown> {
  name: string;                          // snake_case, MCP convention
  description: string;                   // ≤ 200 chars
  inputSchema: z.ZodType<TInput>;
  handler: (input: TInput) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }>;
}
```

### Error flow

```
api-client retry exhausted
  → throws SmitosApiError { status, userMessage }
tool handler catches
  → return format.formatError(err) (content + isError: true)
MCP client (Cowork) displays user-facing message instead of stack trace
```

## Related Code Files

### Create (all under `/Users/dominium/Documents/Project/smitos-mcp-server/`)

- `.env.example`
- `.gitignore` (node_modules, dist, .env)
- `package.json`
- `tsconfig.json`
- `README.md` (skeleton)
- `src/index.ts` (~60 LOC)
- `src/lib/env.ts` (~30 LOC)
- `src/lib/api-client.ts` (~80 LOC)
- `src/lib/format.ts` (~80 LOC)
- `src/lib/tool-registry.ts` (~80 LOC)
- `src/lib/tool-types.ts` (~30 LOC)
- `src/tools/.gitkeep`

### Modify

- None (new repo)

### Delete

- None

## Implementation Steps

1. `mkdir -p /Users/dominium/Documents/Project/smitos-mcp-server && cd $_`
2. `git init && npm init -y`
3. Edit `package.json`:
   - `"type": "module"`
   - `"main": "dist/index.js"`
   - scripts: `build`, `dev`, `start`, `typecheck`
4. Install deps:
   - `npm i @modelcontextprotocol/sdk@~<latest-minor> axios zod zod-to-json-schema dotenv`
   - `npm i -D typescript tsx @types/node`
   - Verify SDK version pinned (check `package-lock.json`).
5. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "nodenext",
       "moduleResolution": "nodenext",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "outDir": "dist",
       "rootDir": "src"
     },
     "include": ["src/**/*"]
   }
   ```
6. Create `.gitignore`: `node_modules/`, `dist/`, `.env`, `*.log`.
7. Create `.env.example`:
   ```
   # SMIT-OS API base URL (Cloudflare Tunnel in prod, http://localhost:3000 in dev)
   SMITOS_API_URL=https://qdashboard.smitbox.com

   # ApiKey generated from SMIT-OS Settings → API Keys. Required scopes:
   # read:reports, read:crm, read:ads, read:revenue, read:okr, read:dashboard
   SMITOS_API_KEY=smk_xxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
8. Create `src/lib/env.ts`:
   - `import 'dotenv/config'`
   - zod schema `{ SMITOS_API_URL: z.string().url(), SMITOS_API_KEY: z.string().startsWith('smk_') }`
   - parse `process.env`; on failure throw with clear message naming missing/invalid vars
   - export validated config object
9. Create `src/lib/api-client.ts`:
   - `axios.create({ baseURL: env.SMITOS_API_URL, timeout: 10_000, headers: { 'X-API-Key': env.SMITOS_API_KEY } })`
   - Response interceptor: on network err or 5xx, retry up to 2 times with `await sleep(500 * 2**attempt)`. On 4xx, no retry.
   - Error mapper: wraps axios error → `SmitosApiError(status, userMessage)`.
   - Export `api` (axios instance) + `SmitosApiError` class.
10. Create `src/lib/format.ts`:
    - `formatTable(rows, columns)` — header row from columns, separator, each row mapped through stringifier (truncate at 60 chars per cell). Wrap in MCP content shape.
    - `formatJson(obj)` — `\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\``.
    - `formatError(err)` — `❌ ${err.userMessage ?? err.message}` (no emoji per project rules — use plain prefix `Error:`). `isError: true`.
11. Create `src/lib/tool-types.ts` (interface above).
12. Create `src/lib/tool-registry.ts`:
    - Use Node `fs/promises` + `path` to walk `src/tools` (or `dist/tools` post-build).
    - For each `.ts`/`.js` file, `await import(pathToFileURL(file).href)`.
    - Validate shape via zod meta-schema; collect `ToolDefinition[]`.
    - Log skipped files with reason.
13. Create `src/index.ts`:
    - Import `{ Server } from '@modelcontextprotocol/sdk/server/index.js'`
    - Import `{ StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'`
    - Validate env (import side-effect).
    - Load tools via `loadTools()`.
    - For each tool, register on server using SDK's recommended API (`server.setRequestHandler` for `ListTools` and `CallTool`, OR `server.tool()` if higher-level API available in pinned version — check SDK README at install time).
    - Convert zod schema to JSON Schema via `zodToJsonSchema(tool.inputSchema)`.
    - Connect stdio transport.
    - SIGTERM/SIGINT → `transport.close()`.
14. Run `npm run typecheck` — clean.
15. Run `npm run build` — `dist/` produced.
16. Smoke: `node dist/index.js` from terminal (no tools yet) → process stays alive, accepts stdin JSON-RPC `{ "method": "tools/list" }`, returns `{ tools: [] }`.
17. Create `README.md` skeleton with sections: Overview · Install · Configure · Tools (to fill) · Troubleshooting (to fill phase 07).
18. `git add -A && git commit -m "chore: scaffold smitos-mcp-server with lib modules"`.

## Todo List

- [ ] `mkdir` + `git init` + `npm init -y`
- [ ] Install runtime deps (SDK pinned, axios, zod, zod-to-json-schema, dotenv)
- [ ] Install dev deps (typescript, tsx, @types/node)
- [ ] Create `tsconfig.json`
- [ ] Create `.gitignore`, `.env.example`
- [ ] Create `src/lib/env.ts`
- [ ] Create `src/lib/api-client.ts` (+ `SmitosApiError`)
- [ ] Create `src/lib/format.ts`
- [ ] Create `src/lib/tool-types.ts`
- [ ] Create `src/lib/tool-registry.ts`
- [ ] Create `src/index.ts`
- [ ] Verify `npm run typecheck` clean
- [ ] Verify `npm run build` produces dist/
- [ ] Smoke test: `node dist/index.js` accepts `tools/list` returns empty array
- [ ] Create README.md skeleton
- [ ] Initial commit

## Success Criteria

- Repo bootable: `node dist/index.js` runs, handles `tools/list` request via stdio.
- All lib files < 200 LOC.
- `tsc --noEmit` passes with `strict: true`.
- SDK version pinned in `package-lock.json` (verify with `npm ls @modelcontextprotocol/sdk`).
- No tools registered yet — phase 05/06 fills `src/tools/`.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SDK breaking change before phase 07 ship | Medium | High | Pin minor; document SDK version in README; weekly check changelog |
| Dynamic tool import path differs between `tsx` (dev) and `node` (prod build) | Medium | Medium | tool-registry resolves base via `import.meta.url`; test both modes in this phase |
| `zod-to-json-schema` output incompatible with MCP SDK expected shape | Low | Medium | SDK accepts standard JSON Schema 7; library validated at install — write 1 smoke tool stub in phase 04 to verify before phase 05 |
| Axios timeout 10s too short for slow PG queries (dashboard endpoints heavy) | Medium | Medium | Default 10s; allow override per-tool via `{ timeout }` config option in api-client wrapper |
| Cold-start scan of `tools/` slow on Windows-style FS (N/A here) | Low | Low | macOS dev + deploy; not applicable |

## Security Considerations

- `.env` ignored by git — raw key never committed.
- `SMITOS_API_KEY` read only at startup; never echoed to logs (api-client.ts must not log the header in axios verbose mode).
- Stdio transport — no network exposure. Only the user's local Claude Desktop process can talk to this server.
- No file write capability — server is read-only relay.
- No shell execution / no exec — pure HTTP client.

## Next Steps

- Phase 05: implement first 5 tools (Reports + Dashboard) using the locked contract.
