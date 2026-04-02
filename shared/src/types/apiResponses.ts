import type { Season, Standing, Team, Round, Game, ScoreEvent } from '@footy-scores/shared/'
import { Prisma } from '@footy-scores/shared'


export type LadderResponse = Array<Prisma.StandingGetPayload<{
    include: { team: true }
}>>

export type GameResponse = Prisma.GameGetPayload<{
    include: {
        homeTeam: true
        awayTeam: true
        scoreEvents: true
    }
}>

export type RoundResponse = Round & {
    games: GameResponse[]
}

export type SeasonResponse = Season & {
    games: Game[]
}

export type CurrentRoundResponse = {
    season: number,
    roundNum: number,
}