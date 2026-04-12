import 'dotenv/config'
import puppeteer from 'puppeteer';
import commandLineArgs from 'command-line-args'
import {db} from "@footy-scores/shared"
import {GameResponse, RoundResponse} from "@footy-scores/shared/src/types/apiResponses";

type GameData = {
    homeTeam: string
    awayTeam: string
    url: string
}

const optionDefinitions = [
    { name: "year", type: Number},
    { name: "start", type: String},
    { name: "skip-db", type: Number}
]

const options = commandLineArgs(optionDefinitions)

if (!options.year) {
    console.error('Missing year argument --year XXXX')
    process.exit(1)
}

if (!options.start) {
    console.error('Missing start argument --start "<\match centre URL of first round in season>"')
    process.exit(1)
}

const initalUrl = options.start

const browser = await puppeteer.launch();
const page = await browser.newPage();

const dbSeason = await db.season.findFirst({
    where: {
        year: options.year
    },
    include: {
        rounds: {
            orderBy: {
                roundNumber: "asc"
            },
            include: {
                games: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                        gameLinks: true
                    }
                }
            }
        }
    }
})

if (!dbSeason) {
    console.error(`Couldn't find season ${options.year} in db!!!`)
    process.exit(1)
}

let dbRounds = dbSeason.rounds as unknown as RoundResponse[]
if (options["skip-db"]){
    dbRounds = dbRounds.slice(options["skip-db"]);
}

await page.goto(initalUrl)

while (true) {

    const roundData = await page.$$eval(".fixtures__details", (fixtureDivs) => {
        const games: GameData[] = []
        fixtureDivs.forEach((fixtureDiv) => {
            const homeDiv = fixtureDiv.querySelector(".fixtures__match-team--home")
            const homeSpan = homeDiv!.querySelector("span.fixtures__match-team-name") as HTMLSpanElement
            const homeTeam = homeSpan.innerText
            const awayDiv = fixtureDiv.querySelector(".fixtures__match-team--away")
            const awaySpan = awayDiv!.querySelector("span.fixtures__match-team-name") as HTMLSpanElement
            const awayTeam = awaySpan.innerText
            const linkEl = fixtureDiv.querySelector("a.fixtures__absolute-link") as HTMLAnchorElement
            const url = linkEl.getAttribute("href") as string

            games.push({
                homeTeam,
                awayTeam,
                url
            })
        })

        return games
    })

    const dbRound: RoundResponse = dbRounds.splice(0, 1)[0]
    for (const aflGame of roundData) {
        let dbGame: GameResponse | null = null
        for (const _dbGame of dbRound.games) {
            if (normaliseTeamName(aflGame.homeTeam) !== _dbGame.homeTeam!.name ||
                normaliseTeamName(aflGame.awayTeam) !== _dbGame.awayTeam!.name) {
                continue
            }
            dbGame = _dbGame
            break
            }

        if (!dbGame) {
            console.error(`Failed to match ${aflGame.homeTeam} v ${aflGame.awayTeam} (${dbRound.name}) in db!!!`)
            continue
        }

        const url = `https://afl.com.au${aflGame.url}`
        await db.gameLinks.upsert({
            where: {
                gameId: dbGame.id
            },
            create: {
                gameId: dbGame.id,
                matchCentre: url
            },
            update: {
                matchCentre: url
            }
        })

        console.log(`Matched ${dbGame.homeTeam!.name} v ${dbGame.awayTeam!.name} (${dbRound.name})`)
        console.log(url)

    }

    const currentUrl = page.url()
    const newUrl = incrementUrlByRound(currentUrl)

    await page.goto(newUrl)
    const newCurrentUrl = page.url()
    if (newCurrentUrl !== newUrl) {
        break
    }
}

console.log("Done!")
process.exit(0)

function normaliseTeamName(name: string): string {
    switch (name) {
        case "Brisbane Lions":
            return "Brisbane"
        case "GWS GIANTS":
            return "GWS"
        case "Gold Coast SUNS":
            return "Gold Coast"
        case "Geelong Cats":
            return "Geelong"
        case "West Coast Eagles":
            return "West Coast"
        case "Sydney Swans":
            return "Sydney"
        case "Adelaide Crows":
            return "Adelaide"
        default:
            return name
    }
}

function incrementUrlByRound(url: string): string {
    const split = url.split("=")
    const roundPart = split.splice(-1, 1)
    const newRound = Number(roundPart[0]) + 1
    return split.join("=") + "=" + String(newRound)
}
