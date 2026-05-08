# Shared Types

Pure TypeScript interface định nghĩa data shapes used cả client + server.

## Usage

```ts
// Client side
import type { ProductSummary } from '@shared/types/dashboard-product';

// Server side
import type { ProductSummary } from '@shared/types/dashboard-product';
```

## Migration Strategy

**Status (2026-05-09):** Foundation setup. Active migrations:
- ✅ `dashboard-product` — types moved to shared, src/types/ re-exports
- ⏸️ `lead-flow`, `lead-distribution`, `dashboard-overview`, `call-performance` — pending

## Convention

- Pure TS interfaces only (no Zod, no React, no runtime deps)
- Server-side validation schemas in `server/schemas/` consume these types via `z.infer<>`
- Client-side imports through this folder, not `src/types/`
