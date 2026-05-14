/**
 * SocialChannel admin service.
 * Token encrypted at rest via AES-GCM (server/lib/crypto.ts).
 * accessTokenEncrypted is NEVER returned in any public method.
 */
import { prisma } from '../../lib/prisma';
import { encrypt, decrypt } from '../../lib/crypto';
import type { SocialChannelCreateInput, SocialChannelUpdateInput } from '../../schemas/social-channel.schema';

// Safe shape — never includes accessTokenEncrypted
export interface SocialChannelDTO {
  id: string;
  platform: string;
  externalId: string;
  name: string;
  tokenExpiresAt: string | null;
  active: boolean;
  lastSyncedAt: string | null;
  lastSyncStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

const SAFE_SELECT = {
  id: true,
  platform: true,
  externalId: true,
  name: true,
  tokenExpiresAt: true,
  active: true,
  lastSyncedAt: true,
  lastSyncStatus: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toDTO(row: {
  id: string; platform: string; externalId: string; name: string;
  tokenExpiresAt: Date | null; active: boolean; lastSyncedAt: Date | null;
  lastSyncStatus: string | null; createdAt: Date; updatedAt: Date;
}): SocialChannelDTO {
  return {
    ...row,
    tokenExpiresAt: row.tokenExpiresAt?.toISOString() ?? null,
    lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listChannels(): Promise<SocialChannelDTO[]> {
  const rows = await prisma.socialChannel.findMany({
    select: SAFE_SELECT,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toDTO);
}

export async function createChannel(input: SocialChannelCreateInput): Promise<SocialChannelDTO> {
  const accessTokenEncrypted = encrypt(input.accessToken);
  const row = await prisma.socialChannel.create({
    data: {
      platform: input.platform,
      externalId: input.externalId,
      name: input.name,
      accessTokenEncrypted,
      tokenExpiresAt: input.tokenExpiresAt ? new Date(input.tokenExpiresAt) : null,
      active: true,
    },
    select: SAFE_SELECT,
  });
  return toDTO(row);
}

export async function updateChannel(id: string, patch: SocialChannelUpdateInput): Promise<SocialChannelDTO | null> {
  const existing = await prisma.socialChannel.findUnique({ where: { id } });
  if (!existing) return null;

  const data: Record<string, unknown> = {};
  if (patch.name !== undefined) data.name = patch.name;
  if (patch.active !== undefined) data.active = patch.active;
  if (patch.tokenExpiresAt !== undefined) data.tokenExpiresAt = new Date(patch.tokenExpiresAt);
  if (patch.accessToken !== undefined) data.accessTokenEncrypted = encrypt(patch.accessToken);

  const row = await prisma.socialChannel.update({
    where: { id },
    data,
    select: SAFE_SELECT,
  });
  return toDTO(row);
}

export async function softDeleteChannel(id: string): Promise<boolean> {
  const existing = await prisma.socialChannel.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.socialChannel.update({ where: { id }, data: { active: false } });
  return true;
}

export interface TestChannelResult {
  ok: boolean;
  pageName?: string;
  error?: string;
}

export async function testChannel(id: string): Promise<TestChannelResult> {
  const channel = await prisma.socialChannel.findUnique({
    where: { id },
    select: { externalId: true, accessTokenEncrypted: true },
  });
  if (!channel) return { ok: false, error: 'Channel not found' };

  const token = decrypt(channel.accessTokenEncrypted);
  const url = `https://graph.facebook.com/v22.0/${channel.externalId}?fields=id,name&access_token=${token}`;

  try {
    const res = await fetch(url);
    const json = (await res.json()) as { id?: string; name?: string; error?: { message: string } };
    if (!res.ok || json.error) {
      return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, pageName: json.name };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
