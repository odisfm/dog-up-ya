import 'dotenv/config'
import { db } from '@footy-scores/shared'
import pullTeams from "./getSquiggleData/pullTeams";
import pullRounds from "./getSquiggleData/pullRounds";

enum AllowedCommands {
    teams="teams",
    rounds="rounds",
    games="games",
    standings="standings",
    tips="tips"
}

const args: string[] = process.argv.slice(2)
const invalidCommandErrorMessage =
    `Invalid args; must provide a command (${Object.values(AllowedCommands).join(', ')})`
const missingYearErrorMessage =
    `Invalid args; must provide a year (year=xxxx)`

if (!args.length) {
    console.error(invalidCommandErrorMessage)
    process.exit(1)
} else if (!(args[0] in AllowedCommands)) {
    console.error(invalidCommandErrorMessage)
    process.exit(1)
}

const command = args[0]

if (!args[1]) {
    console.error(missingYearErrorMessage)
    process.exit(1)
}

const yearArg = args[1]
if (!yearArg.startsWith('year=') || !(yearArg.split('=').length === 2)) {
    console.error(missingYearErrorMessage)
    process.exit(1)
}

const yearDef = yearArg.split("=")[1]
const yearToUse = parseInt(yearDef)
if (isNaN(yearToUse)) {
    console.error(missingYearErrorMessage)
    process.exit(1)
}

(async () => {

    const season = await db.season.findFirst({
        where: {
            year: yearToUse,
        }
    })

    if (!season) {
        console.error(`Season ${yearToUse} not found in DB. Create it manually.`)
        process.exit(1)
    }

    switch (command) {
        case AllowedCommands.teams:
            await pullTeams(season)
            break
        case AllowedCommands.rounds:
            await pullRounds(season)
            break
    }
})()