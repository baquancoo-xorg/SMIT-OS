# Archived Scripts

One-time scripts đã chạy production xong. Giữ làm reference, không add vào package.json.

- `seed-*.ts`: initial DB seeding (users, sprints, weekly reports, workitems, user-crm-employee-id)
- `backfill-*.ts`: data migration (ae, lead-type)
- `fix-*.ts`: ad-hoc fixes (sprints-scopes)
- `verify-*.ts`: spot-check tools (tasks)
- `assign-*.ts`: one-time assignments (okr-owners)
- `sync-*.ts`: historical sync (fb-historical)

Re-run nếu cần bằng path đầy đủ:
```bash
tsx scripts/archive/<file>.ts
```
