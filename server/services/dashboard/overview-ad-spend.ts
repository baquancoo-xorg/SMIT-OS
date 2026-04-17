import { PrismaClient } from '@prisma/client';
import { getGlobalExchangeRate } from '../../lib/currency-converter';
import { formatDate } from '../../lib/date-utils';
import { toNumber, extractLandingPageViews } from './overview-helpers';

const prisma = new PrismaClient();

let conversionRatesCache: { rates: Map<string, number>; expiresAt: number } | null = null;

async function getConversionRates(): Promise<Map<string, number>> {
  if (conversionRatesCache && Date.now() < conversionRatesCache.expiresAt) {
    return conversionRatesCache.rates;
  }
  const globalRate = await getGlobalExchangeRate().catch(() => 27000);
  const safeRate = isFinite(globalRate) && globalRate > 0 ? globalRate : 27000;

  const accounts = await prisma.fbAdAccountConfig.findMany({
    select: { accountId: true, currency: true },
  });
  const rates = new Map<string, number>();
  accounts.forEach((a) => rates.set(a.accountId, a.currency === 'USD' ? safeRate : 1));

  conversionRatesCache = { rates, expiresAt: Date.now() + 60_000 };
  return rates;
}

export async function getAdSpendTotal(from: Date, to: Date): Promise<number> {
  const rates = await getConversionRates();
  const rows = await prisma.rawAdsFacebook.groupBy({
    by: ['accountId'],
    _sum: { spend: true },
    where: { dateStart: { gte: from, lte: to } },
  });
  let total = 0;
  rows.forEach((r) => {
    total += toNumber(r._sum.spend) * (rates.get(r.accountId) ?? 1);
  });
  return total;
}

export async function getAdSpendByDate(from: Date, to: Date): Promise<Map<string, number>> {
  const rates = await getConversionRates();
  const rows = await prisma.rawAdsFacebook.groupBy({
    by: ['dateStart', 'accountId'],
    _sum: { spend: true },
    where: { dateStart: { gte: from, lte: to } },
  });
  const out = new Map<string, number>();
  rows.forEach((r) => {
    const date = formatDate(new Date(r.dateStart));
    const v = toNumber(r._sum.spend) * (rates.get(r.accountId) ?? 1);
    out.set(date, (out.get(date) ?? 0) + v);
  });
  return out;
}

export async function getSessionsByDate(from: Date, to: Date): Promise<Map<string, number>> {
  const rows = await prisma.rawAdsFacebook.findMany({
    where: { dateStart: { gte: from, lte: to } },
    select: { dateStart: true, actions: true },
  });
  const out = new Map<string, number>();
  rows.forEach((r) => {
    const date = formatDate(new Date(r.dateStart));
    out.set(date, (out.get(date) ?? 0) + extractLandingPageViews(r.actions));
  });
  return out;
}
