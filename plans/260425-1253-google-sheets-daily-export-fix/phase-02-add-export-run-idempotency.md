# Phase 02 Add Export Run Idempotency

## Context Links

- Plan: `plan.md`
- Files: `prisma/schema.prisma`, `server/services/sheets-export.service.ts`, `server/routes/sheets-export.routes.ts`, `server/jobs/sheets-export-scheduler.ts`, `server/types/sheets-export.types.ts`

## Overview

Priority: high.

Persist daily export run state in DB so only one Google Sheet is created per Vietnam calendar day.

## Key Insights

- Current `isExporting` only protects one Node process.
- Duplicate exports can happen across restarts, multiple processes, or manual trigger.
- The correct guard is a DB unique constraint by export date.

## Requirements

### Functional

- One completed report per day maximum.
- Same-day retrigger returns existing completed run/URL.
- If export is currently running, new trigger returns existing running status or conflict; it must not create a new sheet.
- Failed same-day export may retry by updating same record, not creating duplicate completed records.

### Non-functional

- Use Prisma ORM, no raw SQL in app code.
- Keep service API simple.
- Avoid queue system for now.

## Architecture

Add Prisma model, suggested name `SheetsExportRun`:

```prisma
model SheetsExportRun {
  id             String    @id @default(uuid())
  exportDate     String    @map("export_date")
  status         String
  spreadsheetId  String?   @map("spreadsheet_id")
  spreadsheetUrl String?   @map("spreadsheet_url")
  sheetsCreated  Int       @default(0) @map("sheets_created")
  error          String?
  startedAt      DateTime  @default(now()) @map("started_at")
  completedAt    DateTime? @map("completed_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@unique([exportDate])
  @@index([status])
  @@map("sheets_export_runs")
}
```

Use Vietnam calendar date for `exportDate`, not UTC ISO date, to match scheduler timezone.

Suggested helper:

```ts
function getVietnamExportDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
```

Service flow:

1. Compute `exportDate`.
2. Check existing run by `exportDate`.
3. If `completed`, return existing result.
4. If `running`, return already-running result.
5. If no run, create `running` row. Unique constraint handles race.
6. If unique conflict occurs, read existing row and return it.
7. Do Google export only after winning DB run ownership.
8. Update row to `completed` or `failed`.

## Related Code Files

Modify:

- `prisma/schema.prisma`
- `server/types/sheets-export.types.ts`
- `server/services/sheets-export.service.ts`
- `server/routes/sheets-export.routes.ts`

Read:

- `server/jobs/sheets-export-scheduler.ts`
- `server/lib/google-sheets-client.ts`

## Implementation Steps

1. Add `SheetsExportRun` model to Prisma schema.
2. Run `npm run db:push` after schema edit.
3. Extend `ExportResult`/`ExportJobStatus` with optional `exportDate`, `spreadsheetId`, `reusedExisting` if needed.
4. Implement Vietnam date helper near export service or in existing date utils if appropriate.
5. Update `SheetsExportService.export()` to use DB run acquisition before calling `doExport()`.
6. Update `doExport(exportDate)` to use the same date in spreadsheet title.
7. Update status responses to include DB run info where helpful.
8. Ensure manual trigger does not bypass idempotency.

## Todo List

- [ ] Add Prisma model and generate/push schema.
- [ ] Add date helper using `Asia/Ho_Chi_Minh`.
- [ ] Add DB run acquisition logic.
- [ ] Update export completion/failure persistence.
- [ ] Update API status/result types.
- [ ] Validate duplicate trigger returns existing run.

## Success Criteria

- Multiple same-day calls create at most one spreadsheet.
- Existing completed run returns previous `spreadsheetUrl`.
- Existing running run does not start another Google export.
- Failed run can retry without creating a second row for same date.

## Risk Assessment

- Risk: using UTC date causes wrong day around midnight. Mitigation: use explicit `Asia/Ho_Chi_Minh` formatter.
- Risk: Google sheet created then DB update fails. Mitigation: update status immediately after export; if DB fails, log error and surface failure. Full reconciliation is out of scope.
- Risk: Prisma generated client stale. Mitigation: run schema push/generate and typecheck.

## Security Considerations

- Do not store OAuth tokens in export run table.
- Do not expose internal error stacks to frontend.

## Next Steps

Proceed to Phase 03 for UI error feedback.

## Unresolved Questions

- None.
