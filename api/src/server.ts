import { serve } from '@hono/node-server'
import { app } from './app.ts'

serve({
    fetch: app.fetch,
    port: 3000,
    hostname: '0.0.0.0'
}, (info) => {
    console.log(`Server is running on http://0.0.0.0:${info.port}`)
})
