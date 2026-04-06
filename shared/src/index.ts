import { resolve } from 'path';

export * from './types/squiggle.ts'
export { db } from './db.ts'
export * as PrismaExports from './generated/prisma/client.ts'
export {Prisma} from './generated/prisma/client.ts'
export type {Season, Team, SeasonTeam, Round, Standing, Tip, ScoreEvent, GameLinks} from './generated/prisma/client.ts'
import type { Game as PrismaGame } from './generated/prisma/client.ts'
export type Game = Omit<PrismaGame, 'unixTime'> & { unixTime: number }
export * as consts from './consts.ts'
