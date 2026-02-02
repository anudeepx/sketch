import { PrismaClient } from "@prisma/client";

const createPrismaClient = (): PrismaClient => {
    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
};

declare const globalThis: {
    prismaGlobal: ReturnType<typeof createPrismaClient>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma;
}

export { prisma };
