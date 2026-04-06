import 'dotenv/config'
import {db, Game} from "@footy-scores/shared"
import {startOfDay, addDays, isSameDay, differenceInDays, differenceInHours} from "date-fns";
import commandLineArgs from 'command-line-args'
import {GameLinks} from "@footy-scores/shared/src/generated/prisma/client";

const optionDefinitions = [
    { name: "round-id", alias: 'r', type: String},
    { name: 'game-id', alias: 'g', type: String},
    { name: 'redo', type: Boolean}
]

const options = commandLineArgs(optionDefinitions)
let gamesToSearch = [];

let redoExistingThreads = false;
if (options.redo) {
    redoExistingThreads = options.redo;
}


(async () => {
    const startOfToday = startOfDay(Date.now())
    const endOfToday = addDays(startOfToday, 1)

    if (options["round-id"]) {
        const roundRecord = await db.round.findFirst({
            where: {
                id: {
                    equals: options["round-id"],
                }
            },
            include: {
                games: {
                    include: {
                        gameLinks: true,
                        homeTeam: true,
                        awayTeam: true,
                        round: true
                    }
                }
            }
        })
        if (!roundRecord) {
            throw new Error(`Invalid round id (${options["round-id"]})`)
        }
        gamesToSearch = roundRecord.games.map(game => {
            return {...game, unixTime: Number(game.unixTime)};
        })
    }
    else if (options["game-id"]) {
        const gameRecord = await db.game.findUnique({
            where:
                {id: options["game-id"]}
            ,
            include: {
                gameLinks: true,
                homeTeam: true,
                awayTeam: true,
                round: true
            }
        })
        if (!gameRecord) {
            throw new Error(`game not found (id ${options["game-id"]})`)
        } else {
            gamesToSearch.push({...gameRecord, unixTime: Number(gameRecord.unixTime)})
        }
    } else {
        const gameRecords = await db.game.findMany({
            where: {
                localTime: {
                    gte: startOfToday,
                    lte: endOfToday,
                }
            },
            include: {
                gameLinks: true,
                homeTeam: true,
                awayTeam: true,
                round: true
            }
        })
        if (gameRecords.length === 0) {
            console.log("No games on today")
            process.exit(0)
        }
        console.log(`Found ${gameRecords.length} games today`)
        for (const record of gameRecords) {
            gamesToSearch.push({...record, unixTime: Number(record.unixTime)})
        }
    }

    console.log(`Searching for ${gamesToSearch.length} games`)

    const commonParams = new URLSearchParams()
    commonParams.append("restrict_sr", "true")
    commonParams.append("sort", "new")
    commonParams.append("type", "link")
    commonParams.append("limit", "100")

    for (const game of gamesToSearch) {
        const currentMatchParams = new URLSearchParams(commonParams)
        const postMatchParams = new URLSearchParams(commonParams)

        const homeTeamName = formatTeamName(game.homeTeam.name)
        const awayTeamName = formatTeamName(game.awayTeam.name)

        currentMatchParams.append(
            "q", `"Match Thread": "${homeTeamName}" "${awayTeamName}" `
        )

        postMatchParams.append(
            "q", `"Post Match Thread": "${homeTeamName}" "${awayTeamName}"`
        )

        const friendlyMatchName = `${homeTeamName} v ${awayTeamName} (R${game.round.roundNumber})`

        const tooSoonHours = 48
        if (differenceInHours(game.localTime, new Date()) > tooSoonHours) {
            console.log(`Skipping ${friendlyMatchName}, more than ${tooSoonHours} hours til kickoff`)
            continue
        }

        let gameLinks: GameLinks | null = game.gameLinks
        if (!gameLinks) {
            gameLinks = await db.gameLinks.create({
                data: {
                    gameId: game.id
                }
            })
        }

        if (!gameLinks.redditAflMatchThread || redoExistingThreads === true) {
            const matchThreadCandidates = await searchRedditThreads(currentMatchParams)
            const bestCandidate = findBestThread(
                matchThreadCandidates,
                "Match Thread",
                [homeTeamName, awayTeamName],
                game.localTime
            )
            if (bestCandidate) {
                await db.gameLinks.update({
                    where: {
                        id: gameLinks.id
                    },
                    data: {
                        redditAflMatchThread: bestCandidate.url
                    }
                })
                console.log(`Found match thread for ${friendlyMatchName}: ${bestCandidate.url}`)
            } else {
                console.log(`Couldn't find match thread for ${friendlyMatchName}`)
            }
        } else {
            console.log(`Skipping match thread search for ${friendlyMatchName}`)
        }

        if (!gameLinks.redditAflPostMatchThread || redoExistingThreads === true) {
            const matchThreadCandidates = await searchRedditThreads(postMatchParams)
            const bestCandidate = findBestThread(
                matchThreadCandidates,
                "Post-Match Discussion Thread",
                [homeTeamName, awayTeamName],
                game.localTime
            )
            if (bestCandidate) {
                await db.gameLinks.update({
                    where: {
                        id: gameLinks.id
                    },
                    data: {
                        redditAflPostMatchThread: bestCandidate.url
                    }
                })
                console.log(`Found post-match thread for ${friendlyMatchName}: ${bestCandidate.url}`)
            } else {
                console.log(`Couldn't find post-match thread for ${friendlyMatchName}`)
            }

        } else {
            console.log(`Skipping post-match thread search for ${friendlyMatchName}`)
        }

    }

    console.log('Done!')
    process.exit(0)

})()


function formatTeamName(name: string): string {
    switch (name) {
        case "Brisbane Lions":
            return "Brisbane"
        case "Greater Western Sydney":
            return "GWS"
        default:
            return name
    }
}

async function searchRedditThreads(params: URLSearchParams, subreddit: string = "afl"): Promise<Record<string, any>[]> {
    const redditResponse = await fetch(
        `https://api.reddit.com/r/afl/search?${params}`,
    )
    if (redditResponse.status !== 200) {
        console.error(`Error with Reddit response`)
        console.error(redditResponse)
        console.error("Exiting...")
        process.exit(1)
    }

    const data = await redditResponse.json()
    return data.data.children.map(child => {
        return child.data
    })
}

function findBestThread(threads: Record<string, any>[], flairText: string, mustContain: string[], createdDate: Date): Record<string, any> | null {
    for (const thread of threads) {
        // threads already sorted by new
        const threadDate = new Date(thread.created_utc * 1000)
        if (!isSameDay(threadDate, createdDate)) { continue }
        let match = true
        if (thread.link_flair_text === flairText) {
            for (const searchText of mustContain) {
                if (thread.title.search(searchText) === -1) {
                    match = false
                    break
                }
            }
            if (!match) continue
            return thread
        }
    }
    return null
}
