# Database Setup & Management

## Initial Setup (First time only)

```bash
# 1. Push schema to database
npm run db:push

# 2. Setup initial data (creates admin user)
npm run db:setup
```

This will create:
- Admin user: `dominium` / giá trị của `ADMIN_INITIAL_PASSWORD`

## Database Commands

```bash
# View database in browser
npm run db:studio

# Push schema changes to database
npm run db:push

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

## Using Real Database

This project uses a **real PostgreSQL database** - no mock or seed data.

All data is managed through:
- **Settings page** (Admin only): Add/Delete users, manage 2FA for accounts
- **OKRs page**: Create/edit objectives & key results, run cycles
- **Reporting pages** (Weekly/Daily Check-in): Submit reports for approval
- **Acquisition Trackers** (Ads/Leads/Media): Sync external data, view dashboards

## Database Schema

Located in `prisma/schema.prisma`. Current models:

**Core**
- **User**: System users with authentication, 2FA (TOTP), multi-department
- **Notification**: User notifications (report approvals, daily check-ins)

**OKR Management**
- **OkrCycle**: Named cycles (e.g., "Q2/2026") with active flag
- **Objective**: Strategic objectives with parent/child hierarchy (L1/L2)
- **KeyResult**: Measurable results aligned to objectives; L2 KRs can align to L1 KRs

**Reporting**
- **WeeklyReport**: Weekly check-ins (Wodtke 5-block format) with approval workflow
- **DailyReport**: Daily syncs (4-field standup) with approval workflow

**Lead Management**
- **Lead**: Leads with status tracking, CRM sync, deletion audit trail
- **LeadAuditLog**: Change history (field diffs)
- **LeadSyncRun**: CRM sync job logs
- **LeadStatusMapping**: Status value mappings (CRM → SMIT)

**Acquisition Tracking**
- **AdCampaign**: Paid ad campaigns (platform-agnostic, MVP: Meta only)
- **AdSpendRecord**: Daily spend/impressions/clicks per campaign
- **MediaPost**: Organic posts + KOL/PR placements with engagement metrics

**FB/Ads Infrastructure**
- **FbAdAccountConfig**: Connected FB Ad Accounts (token, sync state)
- **RawAdsFacebook**: Raw FB Insights data (partitioned by date, account, ad)
- **ExchangeRateSetting**: Currency conversion (USD ↔ VND)
- **EtlErrorLog**: Sync/ETL error tracking
