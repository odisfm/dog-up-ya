import { handle } from 'hono/aws-lambda'
import { app } from './app.ts'

export const handler = handle(app)