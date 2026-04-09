import type {ScoreEvent, Team} from "@footy-scores/shared";
import TeamFlag from "../TeamFlag.tsx";
import "./ScoreEvent.css"

export default function ScoreEventSingle({scoringTeam, homeTeam, awayTeam, event}: {
    scoringTeam: Team,
    homeTeam: Team,
    awayTeam: Team,
    event: ScoreEvent
}) {
    const isHome = event.type === "HOME_GOAL" || event.type === "HOME_BEHIND"
    const isGoal = event.type === "HOME_GOAL" || event.type === "AWAY_GOAL"
    const winningScoreBg = `bg-cyan-800`
    const scoreBg = `bg-mist-800 dark:bg-mist-900`
    const homeWinning = (event.hScore || 0) > (event.aScore || 0)
    const awayWinning = (event.aScore || 0) > (event.hScore || 0)
    const pillStyles = `rounded-md px-2 py-1 `
    const scoreStyles = `flex gap-2 items-center justify-items-center rounded-md px-2`
    const scoreBgWinning = `bg-cyan-700 dark:bg-cyan-800`
    const scoreBgLosing = `bg-mist-800 dark:bg-mist-900`
    return (
        <div className={"even:bg-mist-500 odd:bg-mist-600 even:dark:bg-mist-800 odd:dark:bg-mist-900 " +
            "rounded-md p-2 flex gap-2 items-center"}>
            <span className={`${pillStyles} font-bold bg-mist-800 dark:bg-mist-950  w-1/6`}>
                {event.timeString}
            </span>
            <TeamFlag teamName={scoringTeam.name} size={"xs-sm"}/>
            <span className={`font-bold ml-2`}>
                {scoringTeam.name} {isGoal ? "goal" : "behind"}
            </span>
            <div className={"ml-auto grid grid-cols-2 gap-2 w-1/3"}>
                <div className={`${scoreStyles} ${homeWinning ? scoreBgWinning : scoreBgLosing}`}>
                    <TeamFlag teamName={homeTeam.name} size={"xs"}/>
                    <span>{event.hGoals}.{event.hBehinds}.<strong>{event.hScore}</strong></span>
                </div>
                <div className={`${scoreStyles} ${awayWinning ?  scoreBgWinning : scoreBgLosing}`}>
                    <TeamFlag teamName={awayTeam.name} size={"xs"}/>
                    <span>{event.aGoals}.{event.aBehinds}.<strong>{event.aScore}</strong></span>
                </div>

            </div>
        </div>
    )
}