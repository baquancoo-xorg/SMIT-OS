import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notification.service';
import { childLogger } from '../lib/logger';

const log = childLogger('alert-scheduler');

const TZ = 'Asia/Ho_Chi_Minh';

// Format a Date as YYYY-MM-DD in Vietnam timezone.
function vnDateISO(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

// Parse a YYYY-MM-DD ICT date into a UTC Date marking that day's 00:00 ICT (= 17:00 UTC prev day).
function vnDayStartUTC(dateISO: string): Date {
  return new Date(`${dateISO}T00:00:00+07:00`);
}

// Day-of-week (0=Sun..6=Sat) for the ICT calendar day containing `now`.
const ICT_WEEKDAY: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};
function vnDayOfWeek(now = new Date()): number {
  const short = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(now);
  return ICT_WEEKDAY[short] ?? 0;
}

// Compute the most recent Friday (in ICT) at 00:00 ICT.
// If today is Friday or earlier in week (Mon=1..Sun=0), returns last week's Friday.
// Used as `weekEnding` boundary for weekly reports.
function previousFridayICT(now = new Date()): string {
  const todayISO = vnDateISO(now);
  const today = new Date(`${todayISO}T00:00:00+07:00`);
  const dow = vnDayOfWeek(now); // 0=Sun..6=Sat in ICT calendar
  // Days back to PREVIOUS week's Friday:
  //   Mon(1)→3, Tue(2)→4, Wed(3)→5, Thu(4)→6, Fri(5)→7, Sat(6)→1, Sun(0)→2.
  const daysBack = dow >= 6 ? dow - 5 : dow === 0 ? 2 : dow + 2;
  const friday = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return vnDateISO(friday);
}

async function checkDailyLate(prisma: PrismaClient, notificationService: NotificationService) {
  const todayISO = vnDateISO();
  const dayStart = vnDayStartUTC(todayISO);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const submitted = await prisma.dailyReport.findMany({
    where: { reportDate: { gte: dayStart, lt: dayEnd } },
    select: { userId: true },
  });
  const submittedSet = new Set(submitted.map(r => r.userId));

  const members = await prisma.user.findMany({
    where: { role: 'Member' },
    select: { id: true, fullName: true, departments: true },
  });

  let emitted = 0;
  for (const member of members) {
    if (submittedSet.has(member.id)) continue;
    const admins = await notificationService.findAdminRecipientsFor(member);
    const recipients = Array.from(new Set([member.id, ...admins]));
    if (!recipients.length) continue;
    await notificationService.notifyDailyLate(member, todayISO, recipients);
    emitted++;
  }

  log.info({ todayISO, lateCount: emitted, totalMembers: members.length }, 'daily-late check done');
}

async function checkWeeklyLate(prisma: PrismaClient, notificationService: NotificationService) {
  const weekEndingISO = previousFridayICT();
  const weekEndingDate = vnDayStartUTC(weekEndingISO);

  // Match weekly reports filed for this weekEnding (allow ±12h slack across TZ writes).
  const lower = new Date(weekEndingDate.getTime() - 12 * 60 * 60 * 1000);
  const upper = new Date(weekEndingDate.getTime() + 36 * 60 * 60 * 1000);
  const submitted = await prisma.weeklyReport.findMany({
    where: { weekEnding: { gte: lower, lt: upper } },
    select: { userId: true },
  });
  const submittedSet = new Set(submitted.map(r => r.userId));

  const members = await prisma.user.findMany({
    where: { role: 'Member' },
    select: { id: true, fullName: true, departments: true },
  });

  let emitted = 0;
  for (const member of members) {
    if (submittedSet.has(member.id)) continue;
    const admins = await notificationService.findAdminRecipientsFor(member);
    const recipients = Array.from(new Set([member.id, ...admins]));
    if (!recipients.length) continue;
    await notificationService.notifyWeeklyLate(member, weekEndingISO, recipients);
    emitted++;
  }

  log.info({ weekEndingISO, lateCount: emitted, totalMembers: members.length }, 'weekly-late check done');
}

export function initAlertScheduler(prisma: PrismaClient, notificationService: NotificationService) {
  // Daily late: Mon-Fri 10:30 ICT.
  cron.schedule('30 10 * * 1-5', async () => {
    log.info('running daily-late check');
    try {
      await checkDailyLate(prisma, notificationService);
    } catch (error) {
      log.error({ err: error }, 'error during daily-late check');
    }
  }, { timezone: TZ });

  // Weekly late: Monday 09:00 ICT.
  cron.schedule('0 9 * * 1', async () => {
    log.info('running weekly-late check');
    try {
      await checkWeeklyLate(prisma, notificationService);
    } catch (error) {
      log.error({ err: error }, 'error during weekly-late check');
    }
  }, { timezone: TZ });

  log.info({ timezone: TZ }, 'alert-scheduler initialized: daily-late Mon-Fri 10:30, weekly-late Mon 09:00');
}

// Exported for manual smoke tests + future ad-hoc invocation.
export const __test = { checkDailyLate, checkWeeklyLate, vnDateISO, previousFridayICT, vnDayOfWeek };
