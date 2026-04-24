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
- **Backend:** Express + Prisma ORM
- **Database:** PostgreSQL
- **Auth:** bcryptjs for password hashing
- **Drag & Drop:** @dnd-kit
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

- Authentication with password hashing
- User management (Admin only)
- OKRs tracking with auto-recalculation
- Tech & Product Kanban board
- Marketing Kanban board
- Media Kanban board
- Sales Kanban board
- Weekly reports with approval workflow
- Daily Sync reports
- Settings management

## Database

This project uses a **real PostgreSQL database**. No mock or seed data is used.

All data is managed through:
- **Settings page**: User & Sprint management (Admin only)
- **Kanban boards**: Work items management
- **OKRs page**: Objectives & Key Results

See [DATABASE.md](./DATABASE.md) for more details.
