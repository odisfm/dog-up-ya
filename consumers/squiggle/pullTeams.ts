import {db, Team} from '@footy-scores/shared'
import type {SquiggleTeam} from "@footy-scores/shared";
import {PrismaExports, consts} from '@footy-scores/shared'

export default async function pullTeams(season: PrismaExports.Season) {
    const url = `${consts.SQUIGGLE_API_URL}/?q=teams;year=${season.year}`
    const response = await fetch(url, {
        headers: {"User-Agent": process.env.USER_AGENT_FOR_SQUIGGLE},
    });
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    console.log("Got response from Squiggle")
    console.log(result);

    if (!(typeof result === "object") || !("teams" in result)) {
        throw new Error(`Unexpected response from Squiggle (${typeof result})`)
    }

    const teamsResult: SquiggleTeam[] = result.teams;
    const createdRecords: Team[] = []

    for (const teamData of teamsResult) {

        let teamRecord = await db.team.findFirst({
            where: {
                name: teamData.name,
                abbreviation: teamData.abbrev,
            }
        })

        if (teamRecord) {
            console.log(
                `Team "${teamRecord.name}" already exists`
            )
        } else {
            teamRecord = await db.team.create({
                data: {
                    name: teamData.name,
                    abbreviation: teamData.abbrev,
                }
            })

            console.log(
                `Created Team "${teamRecord.name}" ("${teamRecord.abbreviation}")`)
        }

        let seasonTeamRecord = await db.seasonTeam.findFirst({
            where: {
                seasonId: season.id,
                team: teamRecord
            }
        })

        if (seasonTeamRecord) {
            console.log(
                `SeasonTeam for ${teamRecord.name} ${season.year} already exists`
            )
        } else {
            seasonTeamRecord = await db.seasonTeam.create({
                data: {
                    seasonId: season.id,
                    teamId: teamRecord.id,
                    squiggleTeamId: teamData.id

                }
            })

            console.log(
                `Created SeasonTeam for ${teamRecord.name} ${season.year}`
            )
        }

        createdRecords.push(teamRecord)

    }

    return createdRecords
}