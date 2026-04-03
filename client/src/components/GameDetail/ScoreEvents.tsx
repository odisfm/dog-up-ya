import type {ScoreEvent, Team} from "@footy-scores/shared";
import ScoreEventSingle from "./ScoreEventSingle.tsx";


export default function ScoreEvents({scoreEvents, homeTeam, awayTeam}:
    {
        scoreEvents: ScoreEvent[],
        homeTeam: Team,
        awayTeam: Team,
    }) {

    return (
        <div className={"flex flex-col gap-1 w-full"}>
            { scoreEvents.length === 0 &&
                <span>Both teams yet to score</span>
            }

            { scoreEvents.map((event: ScoreEvent, i)=> {
                return (
                    <ScoreEventSingle
                        team={event.type === "HOME_GOAL" || event.type === "HOME_BEHIND" ? homeTeam : awayTeam}
                        event={event}
                        key={event.id}
                        />
                )
            })}
        </div>
    )
}