import { PrismaClient, FinalType } from './generated/prisma/client.ts'
import { PrismaPg } from '@prisma/adapter-pg'

console.log(process.env.DATABASE_URL)

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const db = new PrismaClient({ adapter })
