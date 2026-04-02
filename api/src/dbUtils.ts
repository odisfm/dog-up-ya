import {db, Prisma, type Round, type Season} from '@footy-scores/shared'
import {differenceInDays} from "date-fns"

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

    if(differenceInDays(nowUnixTime, Number(nearestGame.unixTime) * 1000) <= 1) {
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
