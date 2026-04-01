import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined
}

function createPrismaClient() {
  // Prisma v7: PrismaClient は datasourceUrl を prisma.config.ts から取得
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (PrismaClient as any)()
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
