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
    const scoreStyles = `px-2 py-1 rounded-lg font-bold`
    const homeWinning = (event.hScore || 0) > (event.aScore || 0)
    const awayWinning = (event.aScore || 0) > (event.hScore || 0)
    return (
        <div className={"even:bg-mist-500 odd:bg-mist-600 even:dark:bg-mist-800 odd:dark-bg-mist-900 rounded-md p-2"}>
            <div className={`score-event-single-detail items-center grid w-full grow-1`}>
                <div className={`flex flex-col gap-2 items-center`}>
                    <TeamFlag teamName={homeTeam.name} size={"xs"}/>
                    <span className={`${scoreStyles} ${homeWinning ? winningScoreBg: scoreBg}`}>{event.hGoals}.{event.hBehinds}.{event.hScore}</span>
                </div>
                <div className={"w-2/3 flex flex-col gap-2 justify-self-center bg-mist-800 dark:bg-mist-900 rounded-md p-3"}>
                    <span
                    className={"self-center py-1 px-2 bg-mist-900 dark:bg-mist-950 rounded-lg"}>{event.timeString}</span>
                    <div className={`flex gap-2 justify-self-center items-center self-center`}>
                        <TeamFlag teamName={scoringTeam.name.length < 17 ? scoringTeam.name : scoringTeam.abbreviation}
                                  size={"sm"}/>
                        <span>{scoringTeam.name} {isGoal ? `goal` : `behind`}</span>
                    </div>
                </div>
                <div className={`flex flex-col gap-2 items-center`}>
                    <TeamFlag teamName={awayTeam.name} size={"xs"}/>
                    <span className={`${scoreStyles} ${awayWinning ? winningScoreBg : scoreBg} `}>{event.aGoals}.{event.aBehinds}.{event.aScore}</span>
                </div>
            </div>
        </div>
    )
}