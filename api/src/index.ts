import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {db, type Season} from '@footy-scores/shared'
import * as dbUtils from './dbUtils.js'
import type {
  LadderResponse,
  SeasonResponse,
  GameResponse,
  RoundResponse,
  CurrentRoundResponse, SeasonAllRoundsResponse
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
      season: seasonRecord
    },
    orderBy: {
      rank: "asc"
    },
    include: {
      team: true
    }
  }) satisfies LadderResponse

  return c.json({ data: standingsRecords }, 200)

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
      season: seasonRecord,
      roundNumber

    },
    include: {
      games: {
        include: {
          scoreEvents: true,
          homeTeam: true,
          awayTeam: true
        }
      }
    }
  }) satisfies RoundResponse | null

  if (!roundRecord) {
    return c.json({ error: `No data for season ${year} round ${roundNumber}`})
  }
  roundRecord.games = serialiseGames(roundRecord.games)
  return c.json({data: roundRecord})

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

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
