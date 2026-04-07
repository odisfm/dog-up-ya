import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {db, type Round, type Season} from '@footy-scores/shared'
import * as dbUtils from './dbUtils.js'
import type {
  LadderResponse,
  SeasonResponse,
  GameResponse,
  RoundResponse,
  CurrentRoundResponse,
  SeasonAllRoundsResponse,
  GameDetailsResponse,
  GameDetailsGetPayload,
  GameDetailsPayload,
  LadderPayload
} from "@footy-scores/shared/src/types/apiResponses.js";
import {getCurrentRoundForSeason, getCurrentSeason} from "./dbUtils.js";
import {serialiseGames} from "./utils.js";

const app = new Hono()
app.use(
    cors({
      origin: process.env.ALLOWED_CORS ? process.env.ALLOWED_CORS.split(" ") : []
    })
)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/ladder', (c) => {
  return c.redirect(`/ladder/${new Date().getFullYear()}`)
})

app.get('/ladder/:year', async (c) => {
  let year
  if (c.req.param("year")) {
    year = parseInt(c.req.param("year"))
    if (isNaN(year)) {
      return c.json({ error: `Invalid year "${c.req.param("year")}"` }, 400)
    }
  } else {
    year = new Date().getFullYear()
  }

  const seasonRecord = await dbUtils.getSeasonForYear(year)
  if (!seasonRecord) {
    return c.json({ error: `No data for year "${year}"`}, 500)
  }

  const standingsRecords = await db.standing.findMany({
    where: {
      seasonId: seasonRecord.id
    },
    orderBy: {
      rank: "asc"
    },
    include: {
      team: true
    }
  })
  const data: LadderResponse = {
    ladder: standingsRecords,
    season: seasonRecord
  }

  return c.json({ data }, 200)

})

app.get(`/round/current`, async (c) => {
  const currentSeason = await getCurrentSeason() as Season
  const currentRound = await getCurrentRoundForSeason(currentSeason)
  const response = {roundNum: currentRound.roundNumber, season: currentSeason.year} satisfies CurrentRoundResponse

  return c.json({data: response}, 200)
})

app.get('/round/:year/:roundNumber', async (c) => {
  const year = parseInt(c.req.param("year"))
  const seasonRecord = await db.season.findFirst({
    where: {
      year: year
    },
  })
  if (!seasonRecord) {
    return c.json({ error: `No data for year "${year}"` }, 500)
  }
  const roundNumber = parseInt(c.req.param("roundNumber"))
  const roundRecord =  await db.round.findFirst({
    where: {
      seasonId: seasonRecord.id,
      roundNumber

    },
    include: {
      games: {
        include: {
          scoreEvents: {
            orderBy: {
              time: "desc"
            }
          },
          homeTeam: true,
          awayTeam: true
        }
      }
    }
  })

  if (!roundRecord) {
    return c.json({ error: `No data for season ${year} round ${roundNumber}`})
  }
  const response: RoundResponse = {
    ...roundRecord,
    games: serialiseGames(roundRecord.games)
  }
  return c.json({data: response})

})

app.get(`/season/:year/rounds`, async (c) => {
  const year = parseInt(c.req.param("year"))
  const seasonRecord = await db.season.findFirst({
    where: {
      year: year
    },
    include: {
      rounds: true
    }
  })
  if (!seasonRecord) {
    return c.json({ error: `No data for year "${year}"` }, 500)
  }
  const data = seasonRecord.rounds satisfies SeasonAllRoundsResponse
  return c.json({data}, 200)
})

app.get(`/game/:gameId`, async (c) => {
  const gameId = c.req.param("gameId")
  const gameRecord = await db.game.findUnique({
    where: {
      id: gameId
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      tips: true,
      gameLinks: true,
      scoreEvents: {
        orderBy: {
          time: "desc"
        }
      },
    }
  })
  if (!gameRecord) {
    return c.json({ error: `No game with id ${gameId}`})
  }

  const roundRecord = await db.round.findUnique({
    where: {
      id: gameRecord.roundId
    }
  }) as Round;

  const seasonRecord = await db.season.findUnique({
    where: {
      id: roundRecord.seasonId
    }
  }) as Season;

  const gameResponse = serialiseGames([gameRecord])[0] as GameDetailsPayload
  const response = {
    game: gameResponse,
    round: roundRecord,
    season: seasonRecord
  } satisfies GameDetailsResponse
  return c.json({data: response})

})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
