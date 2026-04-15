import 'dotenv/config'
import { runPull, type Command } from './handler'

const ALLOWED_COMMANDS: Command[] = ['teams', 'rounds', 'games', 'standings', 'tips']

const args = process.argv.slice(2)

if (!args.length || !ALLOWED_COMMANDS.includes(args[0] as Command)) {
    console.error(`Invalid args; must provide a command (${ALLOWED_COMMANDS.join(', ')})`)
    process.exit(1)
}

const yearArg = args[1]
if (!yearArg?.startsWith('year=') || yearArg.split('=').length !== 2) {
    console.error('Invalid args; must provide a year (year=xxxx)')
    process.exit(1)
}

const year = parseInt(yearArg.split('=')[1])
if (isNaN(year)) {
    console.error('Invalid args; must provide a year (year=xxxx)')
    process.exit(1)
}

runPull({ command: args[0] as Command, year })
    .then(() => { console.log('Command complete!'); process.exit(0) })
    .catch((err) => { console.error(err); process.exit(1) })