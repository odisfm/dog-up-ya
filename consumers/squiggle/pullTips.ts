import {db} from '@footy-scores/shared'
import type {SquiggleTip} from "@footy-scores/shared";
import {PrismaExports, consts} from '@footy-scores/shared'

export default async function pullTips(season: PrismaExports.Season) {
    const url = `${consts.SQUIGGLE_API_URL}/?q=tips;year=${season.year}`
    const response = await fetch(url, {
        headers: {"User-Agent": process.env.USER_AGENT_FOR_SQUIGGLE},
    });
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    console.log("Got response from Squiggle")
    console.log(result);

    if (!(typeof result === "object") || !("tips" in result)) {
        throw new Error(`Unexpected response from Squiggle (${typeof result})`)
    }

    const tipsResult: SquiggleTip[] = result.tips;

    for (const tip of tipsResult) {
        const gameRecord = await db.game.findUnique({
            where: {
                squiggleId: tip.gameid
            }
        })

        if (!gameRecord) {
            throw new Error(`No record for game with squiggle id ${tip.gameid}`)
        }

        const tipSeasonTeam = await db.seasonTeam.findFirst({
            where: {
                squiggleTeamId: tip.tipteamid,
                seasonId: season.id
            },
            include: {
                team: true
            }
        })

        if (!tipSeasonTeam) {
            throw new Error(`No record for team with squiggle id ${tip.tipteamid} in year ${season.year}`)
        }

        const error = tip.err ? Number(tip.err) : 0.0
        const margin = tip.margin ? Number(tip.margin) : 0.0
        const confidence = tip.confidence ? Number(tip.confidence) : 0.0
        const bits = tip.bits ? Number(tip.bits) : 0.0

        const tipRecord = await db.tip.upsert({
            where: {
                gameId_sourceName: {
                    gameId: gameRecord.id,
                    sourceName: tip.source
                }
            },
            create: {
                gameId: gameRecord.id,
                sourceId: tip.sourceid,
                sourceName: tip.source,
                confidence,
                error,
                margin,
                bits,
                tipTeamId: tipSeasonTeam.team.id
            },
            update: {
                sourceId: tip.sourceid,
                sourceName: tip.source,
                confidence,
                error,
                margin,
                bits,
                tipTeamId: tipSeasonTeam.team.id
            }
        })

        console.log(`Created tip record!`)
        console.log(tipRecord)
    }

}

