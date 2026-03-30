import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from '@footy-scores/shared'
import * as dbUtils from './dbUtils.js'
import type {LadderResponse, SeasonResponse, GameResponse, RoundResponse} from "@footy-scores/shared/src/types/apiResponses.js";

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

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
