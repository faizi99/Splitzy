import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Next.js automatically loads .env.local, so we don't need dotenv/config
const connectionString = process.env.DATABASE_URL || "file:///home/faizan/Desktop/Splitzy/prisma/dev.db"

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not defined, using fallback:", connectionString)
}

const adapter = new PrismaLibSql({
  url: connectionString,
})

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
