// it is a file that is recommeded by Prisma, saying you need a Client to work with your scheama so do one thing add this file in your folder and use this. I will return prisma method which you can do CRUD or other operations.

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma