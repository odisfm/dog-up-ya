import type {ScoreEvent, Team} from "@footy-scores/shared";
import TeamFlag from "../TeamFlag.tsx";
import "./ScoreEvent.css"

export default function ScoreEventSingle({team, event}: {team: Team, event: ScoreEvent}) {
    const isHome = event.type === "HOME_GOAL" || event.type === "HOME_BEHIND"
    const isGoal = event.type === "HOME_GOAL" || event.type === "AWAY_GOAL"
    return (
        <div className={"flex flex-col even:bg-mist-500 odd:bg-mist-600 even:dark:bg-mist-800 odd:dark-bg-mist-900 p-2 rounded-md"}>
            <span className={"self-center rounded-md px-3 py-1 bg-mist-800 dark:bg-mist-950"}>{event.timeString}</span>
            <div className={`score-event-single-detail items-center grid w-full grow-1 h-10 ${isHome ? `self-start` : `self-end`}`}>
                <span>{event.hGoals}.{event.hBehinds}.{event.hScore}</span>
                <div className={`flex gap-2 justify-self-center items-center rounded-md px-3 py-1 
                bg-mist-500 dark:bg-mist-900`}>
                    <TeamFlag teamName={team.name.length < 17 ? team.name : team.abbreviation}
                              size={"sm"}/>
                    <span>{team.name} {isGoal ? `goal` : `behind`}</span>
                </div>
                <span>{event.aGoals}.{event.aBehinds}.{event.aScore}</span>
            </div>
        </div>
    )
}