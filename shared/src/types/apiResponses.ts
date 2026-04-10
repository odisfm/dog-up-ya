import type { Season, Standing, Team, Round, Game, ScoreEvent } from '@footy-scores/shared/'
import { Prisma } from '@footy-scores/shared'


export type LadderPayload = Array<Prisma.StandingGetPayload<{
    include: { team: true }
}>>

export type LadderResponse = {
    ladder: LadderPayload
    season: Season
}

export type GameGetPayload = Prisma.GameGetPayload<{
    include: {
        homeTeam: true
        awayTeam: true
    }
}>

export type GameDetailsGetPayload = Prisma.GameGetPayload<{
    include: {
        homeTeam: true
        awayTeam: true
        scoreEvents: true
        tips: true
        gameLinks: true
    }
}>

export type GameResponse = Omit<GameGetPayload, 'unixTime'> & { unixTime: number }

export type GameDetailsPayload = Omit<GameDetailsGetPayload, 'unixTime'> & { unixTime: number }


export type RoundResponse = Round & {
    games: GameResponse[]
}


export type CurrentRoundResponse = {
    season: number,
    roundNum: number,
}

export type SeasonResponse = Prisma.SeasonGetPayload<{
    include: {
        rounds: true
        seasonTeams: {
            include: {
                team: true
            }
        }
    }
}>

export type GameDetailsResponse = {
    game: GameDetailsPayload;
    round: Round;
    season: Season;
}

export type ApiDetailsResponse = {
    latestSeason: number
}