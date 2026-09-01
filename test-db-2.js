const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const events = await prisma.scanEvent.findMany({ orderBy: { scannedAt: 'desc' }, take: 2 });
  console.log(events);
}
main().then(() => prisma.$disconnect()).catch(console.error);
