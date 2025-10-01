const { PrismaClient } = require("@prisma/client");

const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();

module.exports = { prisma: globalForPrisma.prisma };
