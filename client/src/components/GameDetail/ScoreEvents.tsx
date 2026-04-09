import type {ScoreEvent, Team} from "@footy-scores/shared";
import ScoreEventSingle from "./ScoreEventSingle.tsx";
import {useMemo} from "react";


export default function ScoreEvents({scoreEvents, homeTeam, awayTeam}:
    {
        scoreEvents: ScoreEvent[],
        homeTeam: Team,
        awayTeam: Team,
    }) {

    const scoreEventIntegrity = useMemo(() => {
        const orderedEvents = scoreEvents.toReversed()
        let homeTeamRunningScore = 0
        let awayTeamRunningScore = 0

        for (const event of orderedEvents) {
            if (event.type === "HOME_GOAL") {
                const expectedScore = homeTeamRunningScore + 6
                if (expectedScore !== event.hScore) {
                    return false
                }
            } else if (event.type === "HOME_BEHIND") {
                const expectedScore = homeTeamRunningScore + 1
                if (expectedScore !== event.hScore) {
                    return false
                }
            } else if (event.type === "AWAY_GOAL") {
                const expectedScore = awayTeamRunningScore + 6
                if (expectedScore !== event.aScore) {
                    return false
                }
            } else if (event.type === "AWAY_BEHIND") {
                const expectedScore = awayTeamRunningScore + 1
                if (expectedScore !== event.aScore) {
                    return false
                }
            }

            homeTeamRunningScore = event.hScore || 0
            awayTeamRunningScore = event.aScore || 0
        }

        return true

    }, [scoreEvents])

    return (
        <div className={"flex flex-col gap-1 w-full"}>
            { scoreEvents.length === 0 &&
                <span>Both teams yet to score</span>
            }

            { !scoreEventIntegrity &&
                <span className={"self-start mt-2 mb-3 px-4 py-1 rounded-md bg-mist-700 dark:bg-mist-900"}>Some scoring shots are missing!</span>
            }

            { scoreEvents.map((event: ScoreEvent, i)=> {
                return (
                    <ScoreEventSingle
                        scoringTeam={event.type === "HOME_GOAL" || event.type === "HOME_BEHIND" ? homeTeam : awayTeam}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        event={event}
                        key={event.id}
                        />
                )
            })}
        </div>
    )
}