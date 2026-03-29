import {db} from '@footy-scores/shared'
import type {SquiggleGame} from "@footy-scores/shared";
import {PrismaExports, consts} from '@footy-scores/shared'

export default async function pullGames(season: PrismaExports.Season) {
    const url = `${consts.SQUIGGLE_API_URL}/?q=games;year=${season.year}`
    const response = await fetch(url, {
        headers: {"User-Agent": process.env.USER_AGENT_FOR_SQUIGGLE},
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

    for (const gameData of gamesResult) {

        const roundRecord = await db.round.findUnique({
            where: {
                seasonId_roundNumber: {
                    seasonId: season.id,
                    roundNumber: gameData.round
                }
            }
        })

        if (!roundRecord) {
            throw new Error(`Missing Round record for ${season.year} round ${gameData.round}`)
        }

        let homeTeam;
        let awayTeam;
        let winnerTeam;

        if (gameData.hteamid) {
            const homeSeasonTeam = await db.seasonTeam.findFirst({
                where: {
                    season: season,
                    squiggleTeamId: gameData.hteamid
                },
                include: {
                    team: true
                }
            })

            if (!homeSeasonTeam) {
                throw new Error(`No SeasonTeam with id ${gameData.hteamid} in season ${season.year}`);
            }

            homeTeam = homeSeasonTeam.team

            const awaySeasonTeam = await db.seasonTeam.findFirst({
                where: {
                    season: season,
                    squiggleTeamId: gameData.ateamid
                },
                include: {
                    team: true
                }
            })

            if (!awaySeasonTeam) {
                throw new Error(`No SeasonTeam with id ${gameData.ateamid} in season ${season.year}`);
            }

            awayTeam = awaySeasonTeam.team

        }

        if (gameData.winnerteamid) {
            const winnerSeasonTeam = await db.seasonTeam.findFirst({
                where: {
                    season: season,
                    squiggleTeamId: gameData.winnerteamid
                },
                include: {
                    team: true
                }
            })

            winnerTeam = winnerSeasonTeam.team
        }

        const gameDate = new Date(gameData.unixtime * 1000)
        const gmtOffset = parseInt(gameData.tz.split(":")[0].slice(1))

        const hScore = gameData.hscore != null ? gameData.hscore : 0
        const hGoals = gameData.hgoals != null ? gameData.hgoals : 0
        const hBehinds = gameData.hbehinds != null ? gameData.hbehinds : 0
        const aScore = gameData.ascore != null ? gameData.ascore : 0
        const aGoals = gameData.agoals != null ? gameData.agoals : 0
        const aBehinds = gameData.abehinds != null ? gameData.abehinds : 0

        const gameRecord = await db.game.upsert({
            where: {
                squiggleId: gameData.id,
            },
            create: {
                round: {connect: {id: roundRecord.id}},
                squiggleId: gameData.id,
                homeTeam:
                    homeTeam ?
                        {connect: {id: homeTeam.id}} :
                        undefined
                ,
                awayTeam:
                    awayTeam ?
                        {connect: {id: awayTeam.id}} :
                        undefined,
                winnerTeam:
                    winnerTeam ?
                        {connect: {id: winnerTeam.id}} :
                        undefined
                ,
                unixTime: gameData.unixtime,
                localTime: gameDate,
                updatedTime: new Date(gameData.updated),
                gmtOffset: gmtOffset,
                hScore,
                hGoals,
                hBehinds,
                aScore,
                aGoals,
                aBehinds,
                timeString: gameData.timestr || undefined,
                venue: gameData.venue,
                progress: gameData.complete,
            },
            update: {
                homeTeam:
                    homeTeam ?
                    {connect: {id: homeTeam.id}} :
                    undefined
                ,
                awayTeam:
                    awayTeam ?
                    {connect: {id: awayTeam.id}} :
                    undefined,
                winnerTeam:
                    winnerTeam ?
                    {connect: {id: winnerTeam.id}} :
                    undefined
                ,
                unixTime: gameData.unixtime,
                localTime: gameDate,
                updatedTime: new Date(gameData.updated),
                gmtOffset: gmtOffset,
                hScore,
                hGoals,
                hBehinds,
                aScore,
                aGoals,
                aBehinds,
                timeString: gameData.timestr || undefined,
                venue: gameData.venue,
                progress: gameData.complete,
            }
        })

        console.log(
            `Created game ${homeTeam?.name} vs ${awayTeam?.name} R${roundRecord.roundNumber} ${season.year}`,
            gameRecord
        )

    }
}