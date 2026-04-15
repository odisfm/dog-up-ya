import {db, Game, Round, Standing, Team, Tip} from '@footy-scores/shared'
import pullTeams from "./pullTeams";
import pullRounds from "./pullRounds";
import pullGames from "./pullGames";
import pullStandings from "./pullStandings";
import pullTips from "./pullTips";

export type Command = 'teams' | 'rounds' | 'games' | 'standings' | 'tips'

export interface PullInput {
    command: Command
    year: number
}

export async function runPull({ command, year }: PullInput): Promise<Game[] | Round[] | Team[] | Tip[] | Standing[]> {
    const season = await db.season.findFirst({
        where: { year }
    })

    if (!season) {
        throw new Error(`Season ${year} not found in DB. Create it manually.`)
    }

    switch (command) {
        case 'teams':     return await pullTeams(season);
        case 'rounds':    return await pullRounds(season);
        case 'games':     return await pullGames(season);
        case 'standings': return await pullStandings(season);
        case 'tips':      return await pullTips(season);
        default:
            throw new Error(`Unknown command: ${command}`)
    }
}