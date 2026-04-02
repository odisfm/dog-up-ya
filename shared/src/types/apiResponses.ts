import type { Season, Standing, Team, Round, Game, ScoreEvent } from '@footy-scores/shared/'
import { Prisma } from '@footy-scores/shared'


export type LadderResponse = Array<Prisma.StandingGetPayload<{
    include: { team: true }
}>>

export type GameGetPayload = Prisma.GameGetPayload<{
    include: {
        homeTeam: true
        awayTeam: true
        scoreEvents: true
    }
}>

export type GameResponse = Omit<GameGetPayload, 'unixTime'> & { unixTime: number }

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

export type SeasonAllRoundsResponse = Round[]

export type GameDetailsResponse = {
    game: GameResponse;
    round: Round;
    season: Season;
}