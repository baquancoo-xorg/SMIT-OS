# Phase 1 — Database Setup (Prisma multi-schema)

**Priority:** P1  •  **Status:** pending  •  **Effort:** 3 days  •  **Days:** 1–3

## Context

- Plan: [../plan.md](./plan.md)
- Research: [research/researcher-01-express-prisma.md](./research/researcher-01-express-prisma.md)
- Source repo (qdashboard): `prisma/schema.prisma`, `prisma/crm-schema.prisma`, `src/lib/db.ts`, `src/lib/crm-db.ts`

## Overview

**Note (Validated):** SMIT OS đã có Prisma setup → merge FB Ads models vào existing schema thay vì setup từ đầu. Review `prisma/schema.prisma` của SMIT OS trước khi thêm models.

Setup 2 Prisma clients trong SMIT OS: **main** (PostgreSQL nội bộ — chứa FB Ads tables) và **CRM** (external read-only). Tạo 4 bảng mới trong main DB, generate 2 client với output paths riêng để tránh type collision.

## Key insights

- 2 DB hoàn toàn khác instance → bắt buộc 2 schema files + 2 generators (option B trong research-01).
- CRM tables đã được PeerDB sync từ MySQL CRM → Postgres (`100.114.94.34:12112`); chỉ cần `db pull` để introspect, KHÔNG migrate.
- `_PEERDB_IS_DELETED` flag = `false` filter cần thiết cho mọi query CRM.
- Token encryption dùng cùng AES-256 logic → giữ helper `crypto.ts` từ qdashboard.

## Requirements

**Functional**
- 2 Prisma clients init ok, query được CRM + Main DB song song.
- 4 model main DB tạo qua migration, schema match qdashboard.
- 1 default `exchange_rate_setting` row seed (USD→VND, rate=27000).

**Non-functional**
- Connection pooling: dùng default Prisma (connection_limit=10).
- Generated clients KHÔNG commit (gitignored, regen ở build).

## Architecture

```
smit-os/
├── prisma/
│   ├── schema.prisma           # Main DB — FB Ads tables
│   ├── crm-schema.prisma       # CRM external — introspected
│   └── migrations/
│       └── 20260418_init_fb_ads/
│           └── migration.sql
└── src/lib/
    ├── db.ts                   # Main Prisma singleton
    └── crm-db.ts               # CRM Prisma singleton + safeCrmQuery
```

## Files

**Create**
- `prisma/schema.prisma`
- `prisma/crm-schema.prisma`
- `src/lib/db.ts`
- `src/lib/crm-db.ts`
- `src/lib/crypto.ts` (token encryption helper)
- `.env.example`

**Modify**
- `package.json` (add scripts + deps)
- `.gitignore` (ignore generated clients)

## Implementation steps

### 1. Install deps

```bash
pnpm add @prisma/client@^6
pnpm add -D prisma@^6
```

### 2. Create `prisma/schema.prisma` (Main DB)

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native"]
  // default output: node_modules/@prisma/client
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model FbAdAccountConfig {
  id                     Int       @id @default(autoincrement())
  accountId              String    @unique @map("account_id")
  accountName            String?   @map("account_name")
  accessTokenEncrypted   String?   @map("access_token_encrypted")
  encryptionKeyEncrypted String?   @map("encryption_key_encrypted")
  tokenExpiresAt         DateTime? @map("token_expires_at")
  currency               String    @default("USD") @db.VarChar(3)
  isActive               Boolean   @default(true) @map("is_active")
  lastSyncAt             DateTime? @map("last_sync_at")
  lastSyncStatus         String?   @map("last_sync_status")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @default(now()) @updatedAt @map("updated_at")

  rawAds RawAdsFacebook[]

  @@index([accountId])
  @@map("fb_ad_account_config")
}

model RawAdsFacebook {
  id                 Int      @id @default(autoincrement())
  accountId          String   @map("account_id")
  dateStart          DateTime @map("date_start") @db.Date
  adId               String?  @map("ad_id")
  adName             String?  @map("ad_name")
  adsetId            String?  @map("adset_id")
  adsetName          String?  @map("adset_name")
  campaignId         String?  @map("campaign_id")
  campaignName       String?  @map("campaign_name")
  campaignObjective  String?  @map("campaign_objective")
  spend              Decimal? @db.Decimal(16, 4)
  impressions        BigInt?
  reach              BigInt?
  clicks             BigInt?
  ctr                Decimal? @db.Decimal(10, 6)
  cpm                Decimal? @db.Decimal(16, 4)
  cpc                Decimal? @db.Decimal(16, 4)
  frequency          Decimal? @db.Decimal(10, 4)
  actions            Json?
  videoViews         Json?    @map("video_views")
  videoPlayCount     Int?     @map("video_play_count")
  videoThruplayCount Int?     @map("video_thruplay_count")
  conversions        Json?
  insightsRaw        Json?    @map("insights_raw")

  utmContent         String?  @map("utm_content")
  utmCampaign        String?  @map("utm_campaign")
  utmSource          String?  @map("utm_source")
  utmMedium          String?  @map("utm_medium")
  syncedAt           DateTime @default(now()) @map("synced_at")

  account FbAdAccountConfig @relation(fields: [accountId], references: [accountId])

  @@unique([accountId, dateStart, adId], name: "accountId_dateStart_adId")
  @@index([dateStart])
  @@index([accountId, dateStart])
  @@map("raw_ads_facebook")
}

model ExchangeRateSetting {
  id           Int      @id @default(autoincrement())
  accountId    Int?     @map("account_id")
  currencyFrom String   @default("USD") @map("currency_from") @db.VarChar(3)
  currencyTo   String   @default("VND") @map("currency_to") @db.VarChar(3)
  exchangeRate Decimal  @map("exchange_rate") @db.Decimal(10, 2)
  isDefault    Boolean  @default(false) @map("is_default")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@unique([accountId, currencyFrom, currencyTo])
  @@index([accountId])
  @@index([isDefault])
  @@map("exchange_rate_settings")
}

model EtlErrorLog {
  id           Int       @id @default(autoincrement())
  sourceId     String?   @map("source_id")
  sourceType   String?   @map("source_type")
  errorType    String?   @map("error_type")
  errorMessage String?   @map("error_message")
  errorDetails Json?     @map("error_details")
  occurredAt   DateTime  @default(now()) @map("occurred_at")
  resolvedAt   DateTime? @map("resolved_at")
  createdAt    DateTime  @default(now()) @map("created_at")

  @@index([sourceType])
  @@index([occurredAt])
  @@map("etl_error_log")
}
```

### 3. Create `prisma/crm-schema.prisma` (CRM External)

Output path riêng để tránh collision:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/crm-client"
}

datasource db {
  provider = "postgresql"
  url      = env("CRM_DATABASE_URL")
}
```

Sau đó introspect từ DB sống:

```bash
npx prisma db pull --schema=prisma/crm-schema.prisma
```

→ Sẽ tự sinh các model `crm_subscribers`, `crm_businesses`, `crm_opportunities`, `business_transaction`, `crm_business_pql_status`, `crm_gate_business_creation`. Sau khi pull, **chỉ giữ lại** 6 models này (xoá các model không dùng để giảm bundle).

Add lại các index thiếu nếu introspect không phát hiện được (thường ok).

### 4. Add @map alias cho compat code qdashboard

Code service ref tới `crmPrisma.crmSubscriber` (camelCase). Sau `db pull` model name sẽ là `crm_subscribers` (snake). Thêm `@@map` + manual rename:

```prisma
model CrmSubscriber {
  // ... fields
  @@map("crm_subscribers")
}

model CrmBusiness {
  // ... fields
  @@map("crm_businesses")
}

model CrmOpportunity {
  // ... fields
  @@map("crm_opportunities")
}
// business_transaction, crm_business_pql_status, crm_gate_business_creation giữ snake
```

### 5. Create `src/lib/db.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### 6. Create `src/lib/crm-db.ts`

```typescript
// @ts-ignore - generated to custom path
import { PrismaClient } from '../../node_modules/.prisma/crm-client';

const globalForCrm = globalThis as unknown as {
  crmPrisma: PrismaClient | undefined;
};

export const crmPrisma =
  globalForCrm.crmPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForCrm.crmPrisma = crmPrisma;
}

export async function isCrmDatabaseAvailable(): Promise<boolean> {
  try {
    await crmPrisma.crmSubscriber.count({ take: 1 });
    return true;
  } catch (err) {
    console.warn('[CRM] connection failed:', (err as Error).message);
    return false;
  }
}

export async function safeCrmQuery<T>(
  fn: () => Promise<T>,
  fallback: T | null = null,
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.warn('[CRM] query failed:', (err as Error).message);
    return fallback;
  }
}

export default crmPrisma;
```

### 7. Create `src/lib/crypto.ts` (AES-256-GCM cho token FB)

```typescript
import crypto from 'node:crypto';

const ALGO = 'aes-256-gcm';
const SECRET = process.env.APP_SECRET ?? '';

if (SECRET.length < 32) {
  console.warn('[crypto] APP_SECRET should be >= 32 chars');
}

const key = crypto.createHash('sha256').update(SECRET).digest();

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
```

### 8. Update `package.json` scripts

```json
{
  "scripts": {
    "prisma:gen": "prisma generate && prisma generate --schema=prisma/crm-schema.prisma",
    "prisma:migrate": "prisma migrate dev",
    "prisma:pull:crm": "prisma db pull --schema=prisma/crm-schema.prisma",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

### 9. Run migration + generate

```bash
pnpm prisma:pull:crm
pnpm prisma:gen
pnpm prisma migrate dev --name init_fb_ads
pnpm db:seed
```

### 10. Seed default exchange rate

`prisma/seed.ts`:

```typescript
import { prisma } from '../src/lib/db';

async function main() {
  await prisma.exchangeRateSetting.upsert({
    where: { accountId_currencyFrom_currencyTo: { accountId: null as any, currencyFrom: 'USD', currencyTo: 'VND' } },
    update: {},
    create: { currencyFrom: 'USD', currencyTo: 'VND', exchangeRate: 27000, isDefault: true },
  });
}

main().finally(() => prisma.$disconnect());
```

### 11. `.env.example`

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/smit_os"
CRM_DATABASE_URL="postgresql://reader:pass@100.114.94.34:12112/crm_replica"
APP_SECRET="generate-32-chars-random-string-here"
PORT=3000
NODE_ENV=development
```

### 12. `.gitignore`

```
node_modules/.prisma/
node_modules/@prisma/client/
```

## Todo

- [ ] **Review existing SMIT OS Prisma schema trước khi merge** (Validated)
- [ ] Install Prisma + client deps (skip if already installed)
- [ ] Write/merge `schema.prisma` 4 models
- [ ] Write `crm-schema.prisma` skeleton
- [ ] `db pull` introspect CRM → trim to 6 models, rename to PascalCase
- [ ] Implement `db.ts` + `crm-db.ts` + `crypto.ts`
- [ ] Add npm scripts
- [ ] Run `prisma:gen`, `migrate dev`, `db:seed`
- [ ] Verify: `crmPrisma.crmSubscriber.count()` returns number
- [ ] Verify: `prisma.exchangeRateSetting.findFirst({ where: { isDefault: true } })` returns row

## Success criteria

- `pnpm prisma:gen` exits 0, generates 2 clients ở 2 paths khác nhau.
- `pnpm prisma migrate dev` creates 4 tables trong main DB.
- Smoke test script `tsx scripts/smoke-db.ts` query được cả 2 DB.
- TypeScript autocomplete hoạt động cho cả `prisma.fbAdAccountConfig.*` và `crmPrisma.crmSubscriber.*` (no `any`).

## Risks

| Risk | Mitigation |
|---|---|
| Type collision giữa 2 PrismaClient | Output paths riêng, import explicit |
| CRM schema drift sau `db pull` | Pin date version, re-pull theo schedule, diff trong PR |
| `_PEERDB_IS_DELETED` field tên có quote | Dùng `@map("_PEERDB_IS_DELETED")` rõ ràng |
| Migration apply lên prod xoá data | `prisma migrate deploy` (no reset) trên prod |

## Security

- `DATABASE_URL` + `CRM_DATABASE_URL` qua env, không commit.
- `APP_SECRET` random 32+ chars, rotate qua restart.
- CRM connection user phải read-only (DB role).

## Next steps

- → Phase 2: implement services dùng 2 clients vừa setup.
