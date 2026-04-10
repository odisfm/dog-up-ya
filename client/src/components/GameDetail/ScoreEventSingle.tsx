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
    const scoreStyles = `flex gap-2 items-center justify-center rounded-md px-2`
    const scoreBgWinning = `bg-cyan-700 dark:bg-cyan-800`
    const scoreBgLosing = `bg-mist-800 dark:bg-mist-950`
    return (
        <div className={"even:bg-mist-500 odd:bg-mist-600 even:dark:bg-mist-800 odd:dark:bg-mist-900 " +
            "rounded-md p-2 flex gap-2 items-center"}>
            <span className={`${pillStyles} font-normal md:font-bold text-xs md:text-md bg-mist-800 dark:bg-mist-950  w-1/6`}>
                {event.timeString}
            </span>
            <div className={"hidden lg:block"}><TeamFlag teamName={scoringTeam.name} size={"xs-sm"}/></div>
            <span className={`font-bold ml-2`}>
                <span className={"inline lg:hidden"}>{scoringTeam.abbreviation}</span>
                <span className={"hidden lg:inline"}>{scoringTeam.name.length < 15 ? scoringTeam.name : scoringTeam.abbreviation}</span> {isGoal ? "goal" : "behind"}
            </span>
            <div className={"ml-auto grid grid-cols-2 gap-2 w-2/5 lg:w-4/10"}>
                <div className={`${scoreStyles} ${homeWinning ? scoreBgWinning : scoreBgLosing}`}>
                    <TeamFlag teamName={homeTeam.name} size={"xs"}/>
                    <div className={""}><span className={"hidden lg:inline"}>{event.hGoals}.{event.hBehinds}.</span><strong>{event.hScore}</strong></div>
                </div>
                <div className={`${scoreStyles} ${awayWinning ?  scoreBgWinning : scoreBgLosing}`}>
                    <div className={"justify-self-start"}><TeamFlag teamName={awayTeam.name} size={"xs"}/></div>
                    <div className={""}><span className={"hidden lg:inline"}>{event.aGoals}.{event.aBehinds}.</span><strong>{event.aScore}</strong></div>
                </div>

            </div>
        </div>
    )
}