import {db} from '@footy-scores/shared'
import type {SquiggleStanding} from "@footy-scores/shared";
import {PrismaExports, consts} from '@footy-scores/shared'

export default async function pullStandings(season: PrismaExports.Season) {
    const url = `${consts.SQUIGGLE_API_URL}/?q=standings;year=${season.year}`
    const response = await fetch(url, {
        headers: {"User-Agent": process.env.USER_AGENT_FOR_SQUIGGLE},
    });
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    console.log("Got response from Squiggle")
    console.log(result);

    if (!(typeof result === "object") || !("standings" in result)) {
        throw new Error(`Unexpected response from Squiggle (${typeof result})`)
    }

    const standingsResult: SquiggleStanding[] = result.standings

    for (const standing of standingsResult) {

        const seasonTeamRecord = await db.seasonTeam.findFirst({
            where: {
                seasonId: season.id,
                squiggleTeamId: standing.id,
            },
            include: {
                team: true,
            }
        })

        if (!seasonTeamRecord) {
            throw new Error(`Missing SeasonTeam record for ${standing.name} ${season.year}`)
        }

        const teamRecord = seasonTeamRecord.team

        const standingRecord = await db.standing.upsert({
            where: {
                teamId_seasonId: {
                    teamId: teamRecord.id,
                    seasonId: season.id,
                }
            },
            create: {
                seasonId: season.id,
                teamId: teamRecord.id,
                rank: standing.rank,
                pointsFor: standing.for,
                pointsAgainst: standing.against,
                goalsFor: standing.goals_for,
                behindsFor: standing.behinds_for,
                goalsAgainst: standing.goals_against,
                behindsAgainst: standing.behinds_against,
                wins: standing.wins,
                losses: standing.losses,
                draws: standing.draws,
                premPoints: standing.pts,
                percentage: standing.percentage,
                played: standing.played
            },
            update: {
                rank: standing.rank,
                pointsFor: standing.for,
                pointsAgainst: standing.against,
                goalsFor: standing.goals_for,
                behindsFor: standing.behinds_for,
                goalsAgainst: standing.goals_against,
                behindsAgainst: standing.behinds_against,
                wins: standing.wins,
                losses: standing.losses,
                draws: standing.draws,
                premPoints: standing.pts,
                percentage: standing.percentage,
                played: standing.played
            }
        })

        console.log(
            `Created Standing record for ${teamRecord.name} ${season.year} (#${standingRecord.rank} ${standingRecord.percentage}%)`,
            standingRecord
        )

    }
}