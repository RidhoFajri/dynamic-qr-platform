const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const qrs = await prisma.qRCode.findMany();
  console.log(qrs);
}
main().then(() => prisma.$disconnect()).catch(console.error);
