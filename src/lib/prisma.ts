import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaLibSql({
    url: "file:./dev.db", // Point to the root dev.db where migrate created it
});

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
