import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';

type MappingInput = {
  username?: string;
  fullName?: string;
  crmEmployeeId: number;
};

const prisma = new PrismaClient();

function parseArgs(argv: string[]) {
  const fileArg = argv.find((arg) => arg.startsWith('--file='));
  if (fileArg) {
    return { file: fileArg.replace('--file=', '').trim() };
  }

  const fileIndex = argv.findIndex((arg) => arg === '--file');
  if (fileIndex >= 0 && argv[fileIndex + 1]) {
    return { file: argv[fileIndex + 1].trim() };
  }

  return { file: '' };
}

function validateInput(input: unknown): MappingInput[] {
  if (!Array.isArray(input)) {
    throw new Error('Input JSON must be an array');
  }

  const normalized: MappingInput[] = [];

  for (const row of input) {
    if (!row || typeof row !== 'object') {
      throw new Error('Each item must be an object');
    }

    const item = row as Record<string, unknown>;
    const username = typeof item.username === 'string' ? item.username.trim() : undefined;
    const fullName = typeof item.fullName === 'string' ? item.fullName.trim() : undefined;
    const crmEmployeeId = item.crmEmployeeId;

    if (!username && !fullName) {
      throw new Error('Each item must include username or fullName');
    }

    if (typeof crmEmployeeId !== 'number' || !Number.isInteger(crmEmployeeId)) {
      throw new Error('crmEmployeeId must be an integer');
    }

    normalized.push({ username, fullName, crmEmployeeId });
  }

  return normalized;
}

async function main() {
  const { file } = parseArgs(process.argv.slice(2));

  if (!file) {
    console.error('Usage: tsx scripts/seed-user-crm-employee-id.ts --file <path-to-json>');
    console.error('JSON format: [{ "username": "kimhue", "crmEmployeeId": 101 }, { "fullName": "Hồng Nhung", "crmEmployeeId": 102 }]');
    process.exit(1);
  }

  const absolutePath = resolve(process.cwd(), file);
  const raw = await readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  const mappings = validateInput(parsed);

  let mapped = 0;
  let notFound = 0;

  for (const item of mappings) {
    const user = item.username
      ? await prisma.user.findUnique({ where: { username: item.username } })
      : await prisma.user.findFirst({ where: { fullName: item.fullName } });

    if (!user) {
      notFound += 1;
      console.warn(`[seed-user-crm-employee-id] user not found: username=${item.username ?? '-'} fullName=${item.fullName ?? '-'}`);
      continue;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { crmEmployeeId: item.crmEmployeeId },
    });

    mapped += 1;
    console.log(`[seed-user-crm-employee-id] mapped ${user.username} -> ${item.crmEmployeeId}`);
  }

  console.log(`[seed-user-crm-employee-id] completed. mapped=${mapped} notFound=${notFound}`);
}

main()
  .catch((error) => {
    console.error('[seed-user-crm-employee-id] failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

