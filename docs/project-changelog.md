# Project Changelog

## [Unreleased]

---

## 2026-04-21

### feat: Lead Logs — Inline Edit + Detail Modal + Export CSV

**Files created:**
- `src/components/lead-tracker/lead-detail-modal.tsx` — read-only popup showing full lead info; closes via X button or backdrop click
- `src/components/lead-tracker/csv-export.ts` — UTF-8 BOM CSV builder and download trigger for Excel compatibility

**Files modified:**
- `src/components/lead-tracker/lead-logs-tab.tsx` — added per-cell inline edit for 5 fields (Status, Resolved Date, Lead Type, UQ Reason, Notes), customer name click-to-detail-modal, and Export CSV button in filter toolbar

**Summary:**
- Clicking a customer name opens `LeadDetailModal` (read-only)
- Clicking an editable cell (Status, Resolved Date, Lead Type, UQ Reason, Notes) shows the appropriate control with auto-save on `onChange`/`onBlur`
- Export CSV button fetches all leads from DB and downloads `leads-export-YYYY-MM-DD.csv` with UTF-8 BOM
- No TypeScript errors; `lead-logs-tab.tsx` remains under 500 lines
