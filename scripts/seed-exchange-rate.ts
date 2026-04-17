import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default exchange rate...');

  const existing = await prisma.exchangeRateSetting.findFirst({
    where: {
      isDefault: true,
      accountId: null,
      currencyFrom: 'USD',
      currencyTo: 'VND',
    },
  });

  if (!existing) {
    await prisma.exchangeRateSetting.create({
      data: {
        currencyFrom: 'USD',
        currencyTo: 'VND',
        exchangeRate: 27000,
        isDefault: true,
      },
    });
    console.log('Default exchange rate created: USD -> VND = 27000');
  } else {
    console.log('Default exchange rate already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
