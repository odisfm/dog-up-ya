import {db, type Game, Prisma, type Round, type Season} from '@footy-scores/shared'
import {differenceInHours} from "date-fns"

export async function getSeasonForYear(year: number) {
    return db.season.findFirst({
        where: {
            year: year,
            isPremSeason: true
        }
    });
}

export async function getCurrentSeason() {
    return db.season.findFirst({
        orderBy: {
            year: "desc"
        }
    })
}

export async function getCurrentRoundForSeason(season: Season): Promise<Round> {
    const nowUnixTime = Date.now()
    const nearestGame = await db.game.findFirst({
        where: {
            unixTime: {
                lt: BigInt(Math.floor(nowUnixTime / 1000)),
            },
            timeString: "Full Time"
        },
        orderBy: {
            unixTime: "desc"
        },
        include: {
            round: true
        }
    }) as Prisma.GameGetPayload<{include: {round: true}}>

    if(differenceInHours(nowUnixTime, Number(nearestGame.unixTime) * 1000) <= 24) {
        return nearestGame.round
    }

    const firstUnplayedGame = await db.game.findFirst({
        where: {
            timeString: null
        },
        orderBy: {
            unixTime: "asc"
        },
        include: {
            round: true
        }
    }) as Prisma.GameGetPayload<{include: {round: true}}>

    return firstUnplayedGame.round

}

export async function getAdjacentGame(gameId: string, direction: "prev" | "next"): Promise<string | null> {
    const thisGame = await db.game.findUniqueOrThrow({
        where: {
            id: gameId,
        },
        include: {
            round: {
                include: {
                    games: {
                        orderBy: {
                            unixTime: "asc"
                        }
                    }
                }
            }
        }
    })

    const gameRound = thisGame.round

    let desiredGame: Game | null = null

    for (let i = 0; i < gameRound.games.length; i++) {
        const iGame = gameRound.games[i]
        if (iGame.id === thisGame.id) {
            if (direction === "prev") {
                if (i === 0) {
                    break
                }
                desiredGame = gameRound.games[i - 1] as unknown as Game
                break
            }
            if (direction === "next") {
                if (i === gameRound.games.length - 1) {
                    break
                }
                desiredGame = gameRound.games[i + 1] as unknown as Game
                break
            }
        }
    }

    if (desiredGame) {
        return desiredGame.id
    }

    let roundNumber: number | null = null
    if (direction === "next") {
        roundNumber = gameRound.roundNumber + 1
    } else {
        roundNumber = gameRound.roundNumber - 1
    }

    const otherRound = await db.round.findFirst({
        where: {
            seasonId: gameRound.seasonId,
            roundNumber: roundNumber
        },
        include: {
            games: {
                orderBy: {
                    unixTime: "asc"
                }
            }
        }
    })

    if (!otherRound || !otherRound.games || !otherRound.games.length) {
        return null
    }

    if (direction === "prev") {
        return otherRound.games.at(-1)!.id
    } else {
        return otherRound.games[0].id
    }

}