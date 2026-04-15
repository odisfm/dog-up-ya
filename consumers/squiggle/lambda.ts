import { runPull, type PullInput } from './handler'
import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

export const handler = async (event: PullInput) => {
    const { command, year } = event
    const secretsClient = new SecretsManagerClient({})

    const { SecretString } = await secretsClient.send(
        new GetSecretValueCommand({ SecretId: 'dog-up-ya-app-server-env' })
    )
    const secrets = JSON.parse(SecretString!)
    process.env.DATABASE_URL = secrets.DATABASE_URL

    if (!command || !year) {
        return { statusCode: 400, body: 'Missing command or year' }
    }

    const result: any[] = await runPull({ command, year })

    return { statusCode: 200, body: result }
}
