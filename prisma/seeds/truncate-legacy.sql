-- Slim-down truncate: drop ALL data in task management + report tables.
-- KEEP: Lead, LeadAuditLog, OkrCycle, FbAdAccountConfig, RawAdsFacebook,
--       ExchangeRateSetting, EtlErrorLog, GoogleIntegration, SheetsExportRun,
--       LeadSyncRun, LeadStatusMapping, User, Notification, Objective, KeyResult.
-- Run BEFORE prisma migrate to avoid migration drop-with-data errors.

BEGIN;

TRUNCATE TABLE "WorkItemDependency" CASCADE;
TRUNCATE TABLE "WorkItemKrLink" CASCADE;
TRUNCATE TABLE "WorkItem" CASCADE;
TRUNCATE TABLE "DailyReport" CASCADE;
TRUNCATE TABLE "WeeklyReport" CASCADE;
TRUNCATE TABLE "Sprint" CASCADE;

COMMIT;
