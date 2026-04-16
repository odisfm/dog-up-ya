import type { PullInput } from './handler'
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

export const handler = async (event: PullInput) => {
    const { command, year } = event
    const secretsClient = new SecretsManagerClient({})

    const { SecretString } = await secretsClient.send(
        new GetSecretValueCommand({ SecretId: 'dog-up-ya-app-server-env' })
    )
    const secrets = JSON.parse(SecretString!)
    process.env.DATABASE_URL = secrets.DATABASE_URL
    process.env.USER_AGENT_FOR_SQUIGGLE = secrets.USER_AGENT_FOR_SQUIGGLE

    if (!command || !year) {
        return { statusCode: 400, body: 'Missing command or year' }
    }

    const { runPull } = await import("./handler")

    const result: any[] = await runPull({ command, year })
    console.log(result)

    return { statusCode: 200, body: result }
}
