import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from '@footy-scores/shared'

const app = new Hono()

console.log(db)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
