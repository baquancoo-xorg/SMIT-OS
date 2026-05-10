-- Demote all Leader users to Member.
-- Plan: 260510-0318-role-simplification
-- Date: 2026-05-10
-- Backup: plans/260510-0318-role-simplification/backups/backup-pre-role-simp-20260510-1422.sql

BEGIN;

-- Verify count before
SELECT 'before' AS phase, COUNT(*) AS leader_count FROM "User" WHERE role LIKE '%Leader%';

-- Demote
UPDATE "User"
SET role = 'Member'
WHERE role LIKE '%Leader%';

-- Verify count after = 0
SELECT 'after' AS phase, role, COUNT(*) AS user_count FROM "User" GROUP BY role ORDER BY role;

COMMIT;
