# SMIT OS - The Kinetic Workspace

A comprehensive workspace management system for managing Tech, Marketing, Media, and Sales operations.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Setup database
```bash
# Push schema to database
npm run db:push

# Setup initial admin user
npm run db:setup
```

### 3. Start development server
```bash
npm run dev
```

Open http://localhost:3000

### 4. Login
- **Username:** `dominium`
- **Password:** giá trị bạn đặt trong `ADMIN_INITIAL_PASSWORD`

## Database Management

```bash
# View database in browser
npm run db:studio

# Push schema changes
npm run db:push

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

## Tech Stack

- **Frontend:** React 19 + TypeScript + TailwindCSS
- **Backend:** Express 5 + Prisma ORM
- **Database:** PostgreSQL 15
- **Auth:** bcryptjs for password hashing + TOTP 2FA (opt-in)
- **UI:** Lucide Icons + Motion

## Project Structure

```
├── prisma/              # Database schema
├── scripts/             # Database setup scripts
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts (Auth)
│   ├── pages/           # Page components
│   └── types/           # TypeScript types
└── server.ts            # Express server
```

## Features

- Authentication with password hashing + TOTP 2FA (opt-in)
- User management (Admin only)
- OKRs tracking with multi-level hierarchy (L1/L2) and auto-recalculation
- Weekly reports (Wodtke 5-block check-in) with approval workflow
- Daily Sync reports (4-field standup) with approval workflow
- Lead management with CRM sync and audit trail
- Acquisition tracking: Paid Ads (Meta), Organic Media Posts, KOL/PR placements
- Ad spend dashboard with multi-platform support (MVP: Meta)
- Lead tracker with status workflow and bulk actions
- Real-time notifications for reports and check-ins

## Database

This project uses a **real PostgreSQL database**. No mock or seed data is used.

All data is managed through:
- **Settings page** (Admin): User & 2FA management
- **OKRs page**: Objectives, Key Results, and cycle management
- **Weekly/Daily pages**: Check-in submissions and approvals
- **Acquisition Trackers**: Lead, Ads, and Media dashboards with external sync

See [DATABASE.md](./docs/DATABASE.md) for detailed schema documentation.
