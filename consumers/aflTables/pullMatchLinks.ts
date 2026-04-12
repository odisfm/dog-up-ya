import 'dotenv/config'
import puppeteer from 'puppeteer';
import commandLineArgs from 'command-line-args'
import {db, Round} from "@footy-scores/shared"
import {GameResponse} from "@footy-scores/shared/src/types/apiResponses";

const optionDefinitions = [
    { name: "year", type: Number},
]

const options = commandLineArgs(optionDefinitions)

if (!options.year) {
    console.error(`Missing year argument`)
}

const season = options.year

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto(`https://afltables.com/afl/seas/${season}.html`);

type GameData = {
    homeTeam: string;
    awayTeam: string;
    url: string | null;
    hScore?: number
    aScore?: number
}

const rounds: GameData[][] = await page.$$eval('table', (tables): GameData[][] => {
    const rounds: GameData[][] = [];

    tables.forEach((table) => {
        const iTables = table.querySelectorAll("table");
        if (!iTables.length) return;

        const round: GameData[] = [];

        iTables.forEach(iTable => {
            const tableRows = iTable.querySelectorAll("tr");
            if (!tableRows.length) return
            const tableData = iTable.querySelectorAll("td");
            if (tableData.length < 5) return;
            for (const td of Array.from(tableData)) {
                if (td.innerText.includes("Ladder")) return;
            }

            const homeTeam = (tableData[0] as HTMLTableCellElement).innerText;
            const awayTeam = (tableData[4] as HTMLTableCellElement).innerText;
            const linkEls = iTable.querySelectorAll("a");
            const url = linkEls[linkEls.length - 1]?.getAttribute("href") ?? null;
            if (url && url.includes("/teams/")) return
            round.push({ homeTeam, awayTeam, url });
        });

        if (round.length) rounds.push(round);
    });

    return rounds;
});

const finalsGames: GameData[] = await page.$$eval('table:not(table table)', (tables): GameData[] => {
    const finalsGames: GameData[] = []
    for (const table of tables) {
        const iTables = table.querySelectorAll("table");
        if (iTables.length) continue
        const tableRows = table.querySelectorAll("tr");
        if (tableRows.length < 2) continue
        const tableData = table.querySelectorAll("td")
        if (tableData.length < 8) continue


        const homeTeam = tableData[0].innerText
        const awayTeam = tableData[4].innerText
        const hScore = Number(tableData[2].innerText)
        const aScore = Number(tableData[6].innerText)
        const linkEls = table.querySelectorAll("a");
        const url = linkEls[linkEls.length - 1]?.getAttribute("href") ?? null;

        if (!homeTeam || !awayTeam) continue

        if (!url) {
            console.error(`Couldn't find url for finals match ${homeTeam} v ${awayTeam}!`)
            continue
        }

        finalsGames.push({
            homeTeam,
            awayTeam,
            url,
            hScore,
            aScore
        })
    }
    return finalsGames;
})

await browser.close();

const dbSeason = await db.season.findFirst({
    where: {
        year: season
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
    console.error(`Couldn't find season ${season}!`)
    process.exit(1)
}

const dbRounds = dbSeason.rounds

for (let i = 0; i < rounds.length; i++) {
    const tablesRound: GameData[] = rounds[i]
    const dbRound = dbRounds[i]

    for (const tablesGame of tablesRound) {
        if (!tablesGame.url) continue
        let dbGame: GameResponse | null = null
        for (const game of dbRound.games) {
            if (normaliseTeamName(tablesGame.homeTeam) === game.homeTeam!.name && normaliseTeamName(tablesGame.awayTeam) === game.awayTeam!.name) {
                dbGame = game as unknown as GameResponse;
                break;
            }
        }
        if (!dbGame) {
            console.error(`Couldn't match AflTables record: round idx ${i}, ${tablesGame.homeTeam} v ${tablesGame.awayTeam}!!!`)
            break
        }

        const fullUrl = `https://afltables.com/afl/${tablesGame.url.split("../")[1]}`

        console.log(`Matched db record: ${dbGame.homeTeam!.abbreviation} v ${dbGame.awayTeam!.abbreviation} (${dbRound.name})`)
        console.log(fullUrl)

        await db.gameLinks.upsert({
            where: {
                gameId: dbGame.id
            },
            create: {
                gameId: dbGame.id,
                aflTables: fullUrl
            },
            update: {
                aflTables: fullUrl
            }
        })
    }
}

const dbFinalsRounds = await db.round.findMany({
    where: {
        seasonId: dbSeason.id,
        finalType: {
            not: "NOT_FINAL"
        }
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
})

for (const tablesGame of finalsGames) {
    let dbFinalsGame: GameResponse | null = null
    let dbRound: Round | null = null
    for (const round of dbFinalsRounds) {
        for (let i = 0; i < round.games.length; i++) {
            const dbGame = round.games[i]
            if (normaliseTeamName(tablesGame.homeTeam) !== dbGame.homeTeam!.name || normaliseTeamName(tablesGame.awayTeam) !== dbGame.awayTeam!.name) {
                continue
            }
            if (tablesGame.hScore !== dbGame.hScore || tablesGame.aScore !== dbGame.aScore) {
                continue
            }
            dbFinalsGame = round.games.splice(i, 1)[0] as unknown as GameResponse;
            dbRound = round
            break
        }
        if (dbFinalsGame) break
    }

    if (!dbFinalsGame) {
        console.error(`Couldn't match AflTables finals game ${tablesGame.homeTeam} (${tablesGame.hScore} b ${tablesGame.aScore} (${tablesGame.aScore})!!!`)
        continue
    }

    const fullUrl = `https://afltables.com/afl/${tablesGame.url!.split("../")[1]}`

    await db.gameLinks.upsert({
        where: {
            gameId: dbFinalsGame.id
        },
        create: {
            gameId: dbFinalsGame.id,
            aflTables: fullUrl
        },
        update: {
            aflTables: fullUrl
        }
    })

    console.log(`Matched db record: ${dbFinalsGame.homeTeam!.abbreviation} v ${dbFinalsGame.awayTeam!.abbreviation} (${dbRound.name})`)
    console.log(fullUrl)

}


console.log("Done!")
process.exit(0)

function normaliseTeamName(name: string): string {
    switch (name) {
        case "Brisbane Lions":
            return "Brisbane"
        case "Greater Western Sydney":
            return "GWS"
        case "Kangaroos":
            return "North Melbourne"
        default:
            return name
    }
}
