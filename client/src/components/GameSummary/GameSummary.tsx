import './GameSummary.css'
import type {Game, Team} from '@footy-scores/shared'
import GameSummaryTeam from "./GameSummaryTeam.tsx";
import GameSummaryScore from "./GameSummaryScore.tsx";
import {createScreenreaderGameDescription} from "../../utils.ts";
import GameProgressBar from "./GameProgressBar/GameProgressBar.tsx";


export default function GameSummary({gameData, homeTeamData, awayTeamData, segmentIdx, segmentLength}:
                                    {
                                        gameData: Game,
                                        homeTeamData: Team | null,
                                        awayTeamData: Team | null,
                                        segmentIdx: number,
                                        segmentLength: number
                                    }) {
    const bg1 = "bg-mist-500 dark:bg-mist-800"
    const bg2 = "bg-mist-600 dark:bg-mist-900"
    const inPlay = !!(gameData.timeString &&
        !["1/4 Time", "1/2 Time", "Half Time", "3/4 Time", "Full Time"].includes(gameData.timeString))
    const isLive = !!(gameData.timeString && gameData.timeString !== "Full Time")
    const basePillStyles = `rounded-md px-3 py-1 justify-self-center self-center text-xs `
    const isEven = segmentIdx % 2 == 0
    const firstOfSegment = segmentIdx === 0
    const lastOfSegment = segmentIdx + 1 === segmentLength
    const bgPillStyles = `${isEven ? "bg-mist-700 dark:bg-mist-900" : "bg-mist-800 dark:bg-mist-800"}`
    const dullPillStyles = `${basePillStyles} ${bgPillStyles}`
    const livePillStyles = `${basePillStyles} bg-cyan-700`
    const now = new Date();
    const gameStart = new Date(gameData.unixTime * 1000)
    const preGame = gameStart > now

    return (
        <div
            className={
            `game-summary flex flex-col gap-2 ${isEven ? bg1 : bg2} self-stretch text-white 
            pt-4 pl-4 pr-4 pb-1 ${firstOfSegment && `rounded-t-md`} ${lastOfSegment && `rounded-b-md`}
            group-hover:bg-mist-400 dark:group-hover:bg-mist-700
            `}
        >
            <span className={"sr-only"}>{createScreenreaderGameDescription(gameData, homeTeamData, awayTeamData)}</span>
            <div className={"game-summary-inner"} aria-hidden={true}>
                <GameSummaryTeam teamData={homeTeamData} homeTeam={true}/>
                <div className={"game-summary-detail gap-2 "}>
                    <span className={`venue-name ${dullPillStyles}`}>{gameData.venue}</span>
                    {preGame &&
                        <>
                        <span className={`pre-game-time text-xl md:text-2xl font-bold self-center`}>
                            {gameStart.toLocaleString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true})}
                        </span>
                        </>
                    }
                    {!preGame &&
                        <>
                            <div className={"home-team"}>
                                <GameSummaryScore
                                    score={gameData.hScore}
                                    margin={gameData.hScore - gameData.aScore}
                                    goals={gameData.hGoals}
                                    behinds={gameData.hBehinds}
                                />
                            </div>
                            <div className={"divider h-8 w-1 rounded-md bg-mist-700 justify-self-center self-center"}></div>
                            <div className={"away-team"}>
                                <GameSummaryScore
                                    score={gameData.aScore}
                                    margin={gameData.aScore - gameData.hScore}
                                    goals={gameData.aGoals}
                                    behinds={gameData.aBehinds}
                                />
                            </div>
                            <span
                                className={`time-string ${inPlay ? livePillStyles : dullPillStyles} font-bold`}
                            >{gameData.timeString}</span>
                        </>
                    }

                </div>
                <GameSummaryTeam teamData={awayTeamData} homeTeam={false}/>
            </div>
            { isLive && <GameProgressBar progress={gameData.progress} timeString={gameData.timeString} />}

        </div>
    )
}