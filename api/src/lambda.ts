import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { handle } from 'hono/aws-lambda'

const client = new SecretsManagerClient({})

const { SecretString } = await client.send(
    new GetSecretValueCommand({ SecretId: 'dog-up-ya-app-server-env' })
)
const secrets = JSON.parse(SecretString!)

process.env.DATABASE_URL = secrets.DATABASE_URL
process.env.ALLOWED_CORS = secrets.ALLOWED_CORS

const { app } = await import('./app.ts')

export const handler = handle(app)
