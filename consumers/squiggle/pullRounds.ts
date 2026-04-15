import {db, Round} from '@footy-scores/shared'
import type {SquiggleGame} from "@footy-scores/shared";
import {PrismaExports, consts} from '@footy-scores/shared'

export default async function pullTeams(season: PrismaExports.Season): Promise<Round[]> {
    const url = `${consts.SQUIGGLE_API_URL}/?q=games;year=${season.year}`
    const response = await fetch(url, {
        headers: {"User-Agent": process.env.USER_AGENT_FOR_SQUIGGLE!},
    });
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    console.log("Got response from Squiggle")
    console.log(result);

    if (!(typeof result === "object") || !("games" in result)) {
        throw new Error(`Unexpected response from Squiggle (${typeof result})`)
    }

    const gamesResult: SquiggleGame[] = result.games
    const roundNumbersProcessed: number[] = []
    const createdRecords: Round[] = []

    for (const gameData of gamesResult) {
        if (roundNumbersProcessed.includes(gameData.round)) {
            continue
        }
        roundNumbersProcessed.push(gameData.round)

        const finalTypeString = Object.values(PrismaExports.FinalType)[gameData.is_final]

        const roundRecord = await db.round.upsert({
            where: {
                seasonId_roundNumber: {
                    seasonId: season.id,
                    roundNumber: gameData.round,
                }
            },
            create: {
                roundNumber: gameData.round,
                name: gameData.roundname,
                finalType: finalTypeString,
                season: { connect: { id: season.id } },
            },
            update: {
                roundNumber: gameData.round,
                name: gameData.roundname,
                finalType: finalTypeString,
            },
        })

        console.log(
            `Created Round ${roundRecord.roundNumber} ${season.year}`,
            roundRecord
        )

        createdRecords.push(roundRecord)

    }

    return createdRecords;
}

