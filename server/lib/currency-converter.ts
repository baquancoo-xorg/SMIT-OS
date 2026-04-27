import { prisma } from './prisma';

export async function getGlobalExchangeRate(): Promise<number> {
  try {
    const row = await prisma.exchangeRateSetting.findFirst({
      where: { isDefault: true, accountId: null },
    });
    return row?.exchangeRate.toNumber() ?? 27000;
  } catch {
    return 27000;
  }
}

export async function getExchangeRate(accountId?: number): Promise<number> {
  if (!accountId) return getGlobalExchangeRate();
  try {
    const row = await prisma.exchangeRateSetting.findFirst({
      where: { accountId, currencyFrom: 'USD', currencyTo: 'VND' },
    });
    return row ? row.exchangeRate.toNumber() : getGlobalExchangeRate();
  } catch {
    return getGlobalExchangeRate();
  }
}
