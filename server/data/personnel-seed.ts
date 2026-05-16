/**
 * Auto-seed Personnel records from existing User.departments.
 * Mapping: Sale→ACCOUNT, Media→MEDIA, Marketing→MARKETING.
 * Skip: BOD/Tech users (admins, leadership) — no Personnel needed.
 * birthDate/Time/Place left null — users fill from Profile page.
 */

import type { PrismaClient, PersonnelPosition } from '@prisma/client';

const DEPT_TO_POSITION: Record<string, PersonnelPosition> = {
  Sale: 'ACCOUNT',
  Media: 'MEDIA',
  Marketing: 'MARKETING',
};

function pickPosition(departments: string[]): PersonnelPosition | null {
  for (const d of departments) {
    if (DEPT_TO_POSITION[d]) return DEPT_TO_POSITION[d];
  }
  return null;
}

export async function seedPersonnel(prisma: PrismaClient): Promise<{ created: number; skipped: number }> {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, departments: true, isAdmin: true, personnel: { select: { id: true } } },
  });

  let created = 0;
  let skipped = 0;
  for (const u of users) {
    if (u.personnel) { skipped++; continue; }
    if (u.isAdmin) { skipped++; continue; }
    const position = pickPosition(u.departments);
    if (!position) { skipped++; continue; }

    await prisma.personnel.create({
      data: {
        userId: u.id,
        position,
        startDate: new Date(),
      },
    });
    created++;
  }

  return { created, skipped };
}
