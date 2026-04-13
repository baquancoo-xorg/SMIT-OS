# Database Setup & Management

## Initial Setup (First time only)

```bash
# 1. Push schema to database
npm run db:push

# 2. Setup initial data (creates admin user)
npm run db:setup
```

This will create:
- Admin user: `dominium` / `change-me-local-only`

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

All data is managed through the Settings page (Admin only):
- Add/Delete users
- Create/Edit/Delete sprints
- Manage work items in each department's Kanban board

## Database Schema

Located in `prisma/schema.prisma`:
- **User**: System users with authentication
- **Sprint**: Sprint cycles for Agile workflow
- **Objective**: Strategic objectives with key results
- **KeyResult**: Measurable results for objectives
- **WorkItem**: Tasks, campaigns, deals, etc.
- **WeeklyReport**: Weekly progress reports with approval workflow
- **DailyReport**: Daily sync reports for task tracking
